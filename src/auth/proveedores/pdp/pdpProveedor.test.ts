import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import { describirContratoProveedor } from '../../../test-utils/contrato-proveedor';
import { crearPdpProveedor } from './pdpProveedor';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('../../../config/env', () => ({
  API_URL: 'http://api.test',
  AUTH_BYPASS: false,
  KEYCLOAK_CONFIG: { url: '', realm: '', clientId: '' },
  PDP_CONFIG: { url: 'http://pdp.test' },
  SECURITY_UI_CONFIG: null,
}));
vi.mock('../../keycloak', () => ({ keycloak: {}, scheduleRefresh: vi.fn(), logout: vi.fn() }));
vi.mock('../../../api/axiosInstance', () => ({ default: { get: mocks.get, post: vi.fn() } }));

const URL_ACTUAL = 'http://localhost:5174/fichas-perfil?pagina=2';
const asignar = vi.fn();

const RUTA_PERFIL = '/usuarios/mi/perfil';

const perfil = (...roles: string[]) => ({
  data: { roles: roles.map((id) => ({ id, nombre: id })) },
});

const conPerfil = (respuestaPerfil: () => Promise<unknown>, respuestaSesion = sesionPdp('Ana')) =>
  mocks.get.mockImplementation((url: string) =>
    url === RUTA_PERFIL ? respuestaPerfil() : Promise.resolve(respuestaSesion),
  );

const sesionPdp = (name: string) => ({
  data: {
    code: 'SESSION_ACTIVE',
    message: 'Authenticated session',
    data: { subject: 'sub-1', name, email: 'ana@uco.test', tenantId: 'uco' },
  },
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('location', { href: URL_ACTUAL, assign: asignar });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describirContratoProveedor('pdp', {
  crear: crearPdpProveedor,
  conSesion: () => conPerfil(() => Promise.resolve(perfil('estudiante'))),
  sinSesion: () => mocks.get.mockRejectedValue(errorApi(401)),
  conFallo: () => mocks.get.mockRejectedValue(errorApi(500)),
  verificarLoginEnCurso: () => expect(asignar).toHaveBeenCalledTimes(1),
  verificarSinRedireccion: () => expect(asignar).not.toHaveBeenCalled(),
  prepararRenovacion: () => conPerfil(() => Promise.resolve(perfil('estudiante'))),
  verificarCierre: () =>
    expect(asignar).toHaveBeenCalledWith('http://pdp.test/api/v1/session/logout'),
});

describe('pdpProveedor', () => {
  it('mapea los roles del perfil a realm_access.roles y consulta la sesión con cookies y el perfil sin baseURL', async () => {
    // Arrange
    conPerfil(() => Promise.resolve(perfil('estudiante', 'asesor-ficha')), sesionPdp(''));

    // Act
    const sesion = await crearPdpProveedor().restaurarSesion(vi.fn());

    // Assert
    expect(sesion).toEqual({
      tokenParsed: {
        sub: 'sub-1',
        preferred_username: 'ana@uco.test',
        email: 'ana@uco.test',
        name: '',
        realm_access: { roles: ['estudiante', 'asesor-ficha'] },
      },
      username: 'ana@uco.test',
    });
    expect(mocks.get).toHaveBeenCalledWith(
      '/api/v1/session',
      expect.objectContaining({
        baseURL: 'http://pdp.test',
        withCredentials: true,
        _omitirProveedorApi: true,
      }),
    );
    expect(mocks.get).toHaveBeenCalledWith(RUTA_PERFIL, { _omitirManejoAuth: true });
  });

  it('recuperarSesionSilenciosa también entrega los roles del perfil', async () => {
    // Arrange
    conPerfil(() => Promise.resolve(perfil('coordinador')));

    // Act
    const sesion = await crearPdpProveedor().recuperarSesionSilenciosa(vi.fn());

    // Assert
    expect(sesion?.tokenParsed.realm_access).toEqual({ roles: ['coordinador'] });
  });

  it('un perfil con roles vacíos deja la sesión sin roles', async () => {
    // Arrange
    conPerfil(() => Promise.resolve(perfil()));

    // Act
    const sesion = await crearPdpProveedor().restaurarSesion(vi.fn());

    // Assert
    expect(sesion?.tokenParsed.realm_access).toEqual({ roles: [] });
  });

  it.each([403, 422])(
    'un perfil con %i deja la sesión sin roles y sin rechazar',
    async (status) => {
      // Arrange
      conPerfil(() => Promise.reject(errorApi(status)));

      // Act
      const sesion = await crearPdpProveedor().restaurarSesion(vi.fn());

      // Assert
      expect(sesion?.tokenParsed.realm_access).toEqual({ roles: [] });
      expect(asignar).not.toHaveBeenCalled();
    },
  );

  it.each([401, 503])('un perfil con %i rechaza y no navega al login', async (status) => {
    // Arrange
    conPerfil(() => Promise.reject(errorApi(status)));

    // Act
    const resultado = crearPdpProveedor().restaurarSesion(vi.fn());

    // Assert
    await expect(resultado).rejects.toBeDefined();
    expect(asignar).not.toHaveBeenCalled();
  });

  it('con /session en 401 no consulta el perfil', async () => {
    // Arrange
    mocks.get.mockRejectedValue(errorApi(401));

    // Act
    const sesion = await crearPdpProveedor().recuperarSesionSilenciosa(vi.fn());

    // Assert
    expect(sesion).toBeNull();
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });

  it('con 401 navega al login del PDP con la URL original codificada en return_to', async () => {
    // Arrange
    mocks.get.mockRejectedValue(errorApi(401));

    // Act
    await crearPdpProveedor().restaurarSesion(vi.fn());

    // Assert
    expect(asignar).toHaveBeenCalledWith(
      `http://pdp.test/oauth2/authorization/keycloak?return_to=${encodeURIComponent(URL_ACTUAL)}`,
    );
  });

  it('credencialesHttp pide cookies con los nombres CSRF, sin Bearer y con el canal de sesión', () => {
    // Act
    const credenciales = crearPdpProveedor().credencialesHttp();

    // Assert
    expect(credenciales).toEqual({
      proveedorApi: 'sesion-pdp',
      conCookies: true,
      nombreCookieCsrf: 'XSRF-TOKEN',
      nombreCabeceraCsrf: 'X-XSRF-TOKEN',
    });
  });

  it('renovarSesion con la sesión viva responde true sin redirigir', async () => {
    // Arrange
    mocks.get.mockResolvedValue(sesionPdp('Ana'));

    // Act
    const renovada = await crearPdpProveedor().renovarSesion();

    // Assert
    expect(renovada).toBe(true);
    expect(asignar).not.toHaveBeenCalled();
  });

  it('renovarSesion con la sesión vencida responde false y redirige al login', async () => {
    // Arrange
    mocks.get.mockRejectedValue(errorApi(401));

    // Act
    const renovada = await crearPdpProveedor().renovarSesion();

    // Assert
    expect(renovada).toBe(false);
    expect(asignar).toHaveBeenCalledTimes(1);
    expect(asignar).toHaveBeenCalledWith(
      `http://pdp.test/oauth2/authorization/keycloak?return_to=${encodeURIComponent(URL_ACTUAL)}`,
    );
  });

  it('renovarSesion con un error distinto de 401 responde false sin redirigir', async () => {
    // Arrange
    mocks.get.mockRejectedValue(errorApi(500));

    // Act
    const renovada = await crearPdpProveedor().renovarSesion();

    // Assert
    expect(renovada).toBe(false);
    expect(asignar).not.toHaveBeenCalled();
  });
});
