import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, type AxiosAdapter } from 'axios';
import apiClient from './axiosInstance';
import type { CredencialesHttp, ProveedorIdentidad } from '../auth/proveedores/proveedor';
import { fijarProveedorActivo } from '../auth/proveedores/proveedorActivo';
import { router } from '../router';
import { resetAllStores, setAuthenticatedUser } from '../test-utils/store.utils';
import { useAuthStore } from '../auth/authStore';

vi.mock('../config/env', () => ({ API_URL: 'http://api.test' }));
vi.mock('../router', () => ({ router: { navigate: vi.fn() } }));
vi.mock('../shared/utils/monitoring', () => ({
  monitoring: { captureError: vi.fn(), captureHttpError: vi.fn() },
}));

const adapterConStatus = (status: number) =>
  vi.fn<AxiosAdapter>(async (config) => {
    if (status < 400) {
      return { data: undefined, status, statusText: '', headers: {}, config };
    }
    throw new AxiosError('fallo', 'ERR_BAD_REQUEST', config, null, {
      status,
      statusText: '',
      headers: {},
      config,
      data: undefined,
    });
  });

const adapterExitoso = () =>
  vi.fn<AxiosAdapter>(async (config) => ({
    data: {},
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }));

function proveedorDoble(credenciales: CredencialesHttp = { bearer: 'tk' }, renovada = true) {
  return {
    id: 'doble',
    restaurarSesion: vi.fn(),
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    credencialesHttp: vi.fn(() => credenciales),
    renovarSesion: vi.fn().mockResolvedValue(renovada),
  } satisfies ProveedorIdentidad;
}

const adapterOriginal = apiClient.defaults.adapter;

beforeEach(() => {
  vi.clearAllMocks();
  resetAllStores();
  fijarProveedorActivo(null);
});

afterEach(() => {
  apiClient.defaults.adapter = adapterOriginal;
});

describe('axiosInstance: credenciales del proveedor activo', () => {
  it('con bearer adjunta Authorization y no activa cookies', async () => {
    // Arrange
    fijarProveedorActivo(proveedorDoble({ bearer: 'abc' }));
    const adapter = adapterExitoso();
    apiClient.defaults.adapter = adapter;

    // Act
    await apiClient.get('/algo');

    // Assert
    const config = adapter.mock.calls[0][0];
    expect(config.headers.get('Authorization')).toBe('Bearer abc');
    expect(config.withCredentials).toBeFalsy();
  });

  it('con cookies activa withCredentials y la protección CSRF, sin Authorization', async () => {
    // Arrange
    fijarProveedorActivo(
      proveedorDoble({
        conCookies: true,
        nombreCookieCsrf: 'XSRF-TOKEN',
        nombreCabeceraCsrf: 'X-XSRF-TOKEN',
      }),
    );
    const adapter = adapterExitoso();
    apiClient.defaults.adapter = adapter;

    // Act
    await apiClient.get('/algo');

    // Assert
    const config = adapter.mock.calls[0][0];
    expect(config.withCredentials).toBe(true);
    expect(config.xsrfCookieName).toBe('XSRF-TOKEN');
    expect(config.xsrfHeaderName).toBe('X-XSRF-TOKEN');
    expect(config.headers.get('Authorization')).toBeFalsy();
  });

  it('sin proveedor (bypass) usa el token del store', async () => {
    // Arrange
    setAuthenticatedUser({ token: 'del-store' });
    const adapter = adapterExitoso();
    apiClient.defaults.adapter = adapter;

    // Act
    await apiClient.get('/algo');

    // Assert
    expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer del-store');
  });
});

describe('axiosInstance: _omitirManejoAuth', () => {
  it('con la bandera, un 401 no renueva la sesión ni reintenta la petición', async () => {
    // Arrange
    const proveedor = proveedorDoble();
    fijarProveedorActivo(proveedor);
    const adapter = adapterConStatus(401);
    apiClient.defaults.adapter = adapter;

    // Act
    await expect(
      apiClient.post('/auth/logout', undefined, { _omitirManejoAuth: true }),
    ).rejects.toThrow();

    // Assert
    expect(proveedor.renovarSesion).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('con la bandera, un 403 no navega a /forbidden', async () => {
    // Arrange
    apiClient.defaults.adapter = adapterConStatus(403);

    // Act
    await expect(
      apiClient.post('/auth/logout', undefined, { _omitirManejoAuth: true }),
    ).rejects.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('sin la bandera, un 403 sigue navegando a /forbidden', async () => {
    // Arrange
    apiClient.defaults.adapter = adapterConStatus(403);

    // Act
    await expect(apiClient.get('/algo')).rejects.toThrow();

    // Assert
    await vi.waitFor(() => expect(router.navigate).toHaveBeenCalledWith('/forbidden'));
  });
});

describe('axiosInstance: renovación ante 401', () => {
  it('si el proveedor renueva, reintenta la petición una vez', async () => {
    // Arrange
    const proveedor = proveedorDoble({ bearer: 'tk' }, true);
    fijarProveedorActivo(proveedor);
    const adapter = adapterConStatus(401);
    apiClient.defaults.adapter = adapter;

    // Act
    await expect(apiClient.get('/algo')).rejects.toThrow();

    // Assert
    expect(proveedor.renovarSesion).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('si el proveedor no renueva, no reintenta la petición', async () => {
    // Arrange
    const proveedor = proveedorDoble({ bearer: 'tk' }, false);
    fijarProveedorActivo(proveedor);
    const adapter = adapterConStatus(401);
    apiClient.defaults.adapter = adapter;

    // Act
    await expect(apiClient.get('/algo')).rejects.toThrow();

    // Assert
    expect(proveedor.renovarSesion).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('varias peticiones concurrentes con 401 disparan una sola renovación', async () => {
    // Arrange
    const proveedor = proveedorDoble();
    proveedor.renovarSesion.mockImplementation(
      () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 0)),
    );
    fijarProveedorActivo(proveedor);
    apiClient.defaults.adapter = adapterConStatus(401);

    // Act
    await Promise.allSettled([apiClient.get('/a'), apiClient.get('/b'), apiClient.get('/c')]);

    // Assert
    expect(proveedor.renovarSesion).toHaveBeenCalledTimes(1);
  });

  it('sin proveedor un 401 no se renueva ni se reintenta', async () => {
    // Arrange
    const adapter = adapterConStatus(401);
    apiClient.defaults.adapter = adapter;

    // Act
    await expect(apiClient.get('/algo')).rejects.toThrow();

    // Assert
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});

describe('axiosInstance: _sinCredenciales', () => {
  const adapterOriginal = apiClient.defaults.adapter;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    apiClient.defaults.adapter = adapterOriginal;
    useAuthStore.setState({ token: undefined });
  });

  it('con la opción, la petición sale sin Authorization', async () => {
    // Arrange
    useAuthStore.setState({ token: 'token-de-sesion' });
    const adapter = adapterConStatus(204);
    apiClient.defaults.adapter = adapter;

    // Act
    await apiClient.post('http://minio.test/bucket', undefined, { _sinCredenciales: true });
    await apiClient.post('/otra', undefined);

    // Assert
    expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBeFalsy();
    expect(adapter.mock.calls[1][0].headers.get('Authorization')).toBe('Bearer token-de-sesion');
  });

  it('con la opción, un 401 y un 403 no refrescan el token ni navegan', async () => {
    // Arrange
    const proveedor = proveedorDoble();
    fijarProveedorActivo(proveedor);
    const adapter401 = adapterConStatus(401);
    apiClient.defaults.adapter = adapter401;

    // Act
    await expect(
      apiClient.post('http://minio.test/b', undefined, { _sinCredenciales: true }),
    ).rejects.toThrow();
    apiClient.defaults.adapter = adapterConStatus(403);
    await expect(
      apiClient.post('http://minio.test/b', undefined, { _sinCredenciales: true }),
    ).rejects.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    expect(proveedor.renovarSesion).not.toHaveBeenCalled();
    expect(adapter401).toHaveBeenCalledTimes(1);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
