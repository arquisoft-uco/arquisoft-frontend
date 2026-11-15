import { beforeEach, describe, expect, it, vi } from 'vitest';
import { errorApi } from '../../../test-utils/errores-api';
import { describirContratoProveedor } from '../../../test-utils/contrato-proveedor';
import { crearKeycloakProveedor } from './keycloakProveedor';

const mocks = vi.hoisted(() => ({
  keycloak: {
    init: vi.fn(),
    didInitialize: false,
    authenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateToken: vi.fn(),
    token: undefined as string | undefined,
    tokenParsed: undefined as Record<string, unknown> | undefined,
  },
  scheduleRefresh: vi.fn(),
  logout: vi.fn(),
  post: vi.fn(),
  refresco: { onRefresh: undefined as ((token: string) => void) | undefined },
}));

vi.mock('../../keycloak', () => ({
  keycloak: mocks.keycloak,
  scheduleRefresh: mocks.scheduleRefresh,
  logout: mocks.logout,
}));
vi.mock('../../../api/axiosInstance', () => ({ default: { post: mocks.post, get: vi.fn() } }));
vi.mock('../../../shared/utils/monitoring', () => ({
  monitoring: { captureError: vi.fn(), captureHttpError: vi.fn() },
}));

const REDIRECT = 'http://app.test';

function sesionIniciada() {
  mocks.keycloak.init.mockResolvedValue(true);
  mocks.keycloak.token = 'token-vivo';
  mocks.keycloak.tokenParsed = { sub: 'u-1', preferred_username: 'ana' };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.keycloak.token = undefined;
  mocks.keycloak.tokenParsed = undefined;
  mocks.keycloak.didInitialize = false;
  mocks.keycloak.authenticated = false;
  mocks.refresco.onRefresh = undefined;
  mocks.scheduleRefresh.mockImplementation((onRefresh: (token: string) => void) => {
    mocks.refresco.onRefresh = onRefresh;
    return vi.fn();
  });
  mocks.post.mockResolvedValue({ data: undefined });
});

describirContratoProveedor('keycloak', {
  crear: crearKeycloakProveedor,
  conSesion: sesionIniciada,
  sinSesion: () => mocks.keycloak.init.mockResolvedValue(false),
  conFallo: () => mocks.keycloak.init.mockRejectedValue(new Error('init falló')),
  verificarLoginEnCurso: () => expect(mocks.keycloak.init).toHaveBeenCalledTimes(1),
  verificarSinRedireccion: () => expect(mocks.keycloak.login).not.toHaveBeenCalled(),
  prepararRenovacion: () => mocks.keycloak.updateToken.mockResolvedValue(true),
  verificarCierre: () => expect(mocks.logout).toHaveBeenCalledWith('http://app.test'),
  provocarRenovacionDeSesion: () => mocks.refresco.onRefresh?.('token-nuevo'),
});

describe('keycloakProveedor', () => {
  it('inicializa Keycloak con login-required y PKCE una sola vez aunque se restaure dos veces', async () => {
    // Arrange
    sesionIniciada();
    const proveedor = crearKeycloakProveedor();

    // Act
    await proveedor.restaurarSesion(vi.fn());
    await proveedor.restaurarSesion(vi.fn());

    // Assert
    expect(mocks.keycloak.init).toHaveBeenCalledTimes(1);
    expect(mocks.keycloak.init).toHaveBeenCalledWith(
      expect.objectContaining({ onLoad: 'login-required', pkceMethod: 'S256' }),
    );
  });

  it('recuperarSesionSilenciosa inicializa con check-sso sin iframe silencioso', async () => {
    // Arrange
    sesionIniciada();
    const proveedor = crearKeycloakProveedor();

    // Act
    await proveedor.recuperarSesionSilenciosa(vi.fn());

    // Assert
    const opciones = mocks.keycloak.init.mock.calls[0][0];
    expect(opciones).toEqual(expect.objectContaining({ onLoad: 'check-sso' }));
    expect(opciones).not.toHaveProperty('silentCheckSsoRedirectUri');
  });

  it('tras un check-sso sin sesión, restaurarSesion inicia el login y no vuelve a llamar init', async () => {
    // Arrange
    mocks.keycloak.init.mockImplementation(async () => {
      mocks.keycloak.didInitialize = true;
      return false;
    });
    mocks.keycloak.login.mockResolvedValue(undefined);
    await crearKeycloakProveedor().recuperarSesionSilenciosa(vi.fn());

    // Act
    const sesion = await crearKeycloakProveedor().restaurarSesion(vi.fn());

    // Assert
    expect(sesion).toBeNull();
    expect(mocks.keycloak.init).toHaveBeenCalledTimes(1);
    expect(mocks.keycloak.login).toHaveBeenCalledTimes(1);
  });

  it('credencialesHttp entrega siempre el token vivo de Keycloak', () => {
    // Arrange
    const proveedor = crearKeycloakProveedor();
    mocks.keycloak.token = 'primero';

    // Act
    const antes = proveedor.credencialesHttp();
    mocks.keycloak.token = 'segundo';
    const despues = proveedor.credencialesHttp();

    // Assert
    expect(antes).toEqual({ proveedorApi: 'legado', bearer: 'primero' });
    expect(despues).toEqual({ proveedorApi: 'legado', bearer: 'segundo' });
  });

  it('si renovar falla cierra sesión en Keycloak una sola vez y responde false', async () => {
    // Arrange
    mocks.keycloak.updateToken.mockRejectedValue(new Error('refresh inválido'));
    const proveedor = crearKeycloakProveedor();

    // Act
    const renovada = await proveedor.renovarSesion();

    // Assert
    expect(renovada).toBe(false);
    expect(mocks.keycloak.logout).toHaveBeenCalledTimes(1);
  });

  it('cerrarSesion revoca en el backend sin manejo de auth y con timeout antes de redirigir', async () => {
    // Arrange
    const proveedor = crearKeycloakProveedor();

    // Act
    await proveedor.cerrarSesion(REDIRECT);

    // Assert
    expect(mocks.post).toHaveBeenCalledWith('/auth/logout', undefined, {
      timeout: 5000,
      _omitirManejoAuth: true,
    });
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(mocks.logout).toHaveBeenCalledWith(REDIRECT);
  });

  it.each([
    ['401', errorApi(401)],
    ['403', errorApi(403)],
    ['error de red', new Error('Network Error')],
  ])('cerrarSesion redirige aunque la revocación falle con %s', async (_caso, fallo) => {
    // Arrange
    mocks.post.mockRejectedValue(fallo);
    const proveedor = crearKeycloakProveedor();

    // Act
    await proveedor.cerrarSesion(REDIRECT);

    // Assert
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(mocks.logout).toHaveBeenCalledWith(REDIRECT);
  });
});
