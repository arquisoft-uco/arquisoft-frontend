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
  conSesion: () => mocks.get.mockResolvedValue(sesionPdp('Ana')),
  sinSesion: () => mocks.get.mockRejectedValue(errorApi(401)),
  conFallo: () => mocks.get.mockRejectedValue(errorApi(500)),
  verificarLoginEnCurso: () => expect(asignar).toHaveBeenCalledTimes(1),
  prepararRenovacion: () => mocks.get.mockResolvedValue(sesionPdp('Ana')),
  verificarCierre: () =>
    expect(asignar).toHaveBeenCalledWith('http://pdp.test/api/v1/session/logout'),
});

describe('pdpProveedor', () => {
  it('mapea la sesión con nombre vacío, sin roles y sin token, y consulta con cookies', async () => {
    // Arrange
    mocks.get.mockResolvedValue(sesionPdp(''));

    // Act
    const sesion = await crearPdpProveedor().restaurarSesion(vi.fn());

    // Assert
    expect(sesion).toEqual({
      tokenParsed: {
        sub: 'sub-1',
        preferred_username: 'ana@uco.test',
        email: 'ana@uco.test',
        name: '',
        realm_access: { roles: [] },
      },
      username: 'ana@uco.test',
    });
    expect(mocks.get).toHaveBeenCalledWith(
      '/api/v1/session',
      expect.objectContaining({ baseURL: 'http://pdp.test', withCredentials: true }),
    );
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

  it('credencialesHttp pide cookies con los nombres CSRF y sin Bearer', () => {
    // Act
    const credenciales = crearPdpProveedor().credencialesHttp();

    // Assert
    expect(credenciales).toEqual({
      conCookies: true,
      nombreCookieCsrf: 'XSRF-TOKEN',
      nombreCabeceraCsrf: 'X-XSRF-TOKEN',
    });
  });

  it('renovarSesion con la sesión viva responde false sin redirigir', async () => {
    // Arrange
    mocks.get.mockResolvedValue(sesionPdp('Ana'));

    // Act
    const renovada = await crearPdpProveedor().renovarSesion();

    // Assert
    expect(renovada).toBe(false);
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
  });
});
