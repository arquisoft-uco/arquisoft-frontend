import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import apiClient from './axiosInstance';
import { keycloak } from '../auth/keycloak';
import { router } from '../router';
import { useAuthStore } from '../auth/authStore';

vi.mock('../config/env', () => ({ API_URL: 'http://api.test' }));
vi.mock('../auth/keycloak', () => ({
  keycloak: { updateToken: vi.fn(), logout: vi.fn(), token: undefined, tokenParsed: undefined },
}));
vi.mock('../router', () => ({ router: { navigate: vi.fn() } }));
vi.mock('../shared/utils/monitoring', () => ({
  monitoring: { captureError: vi.fn(), captureHttpError: vi.fn() },
}));

const adapterConStatus = (status: number) => {
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
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
  return adapter as unknown as AxiosAdapter & typeof adapter;
};

describe('axiosInstance: _omitirManejoAuth', () => {
  const adapterOriginal = apiClient.defaults.adapter;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('con la bandera, un 401 no refresca el token ni reintenta la petición', async () => {
    // Arrange
    const adapter = adapterConStatus(401);
    apiClient.defaults.adapter = adapter;

    // Act
    await expect(
      apiClient.post('/auth/logout', undefined, { _omitirManejoAuth: true }),
    ).rejects.toThrow();

    // Assert
    expect(keycloak.updateToken).not.toHaveBeenCalled();
    expect(keycloak.logout).not.toHaveBeenCalled();
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

describe('axiosInstance: refresco de token ante 401', () => {
  const adapterOriginal = apiClient.defaults.adapter;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('si el refresco falla, cierra sesión una vez y no reintenta la petición', async () => {
    // Arrange
    const adapter = adapterConStatus(401);
    apiClient.defaults.adapter = adapter;
    vi.mocked(keycloak.updateToken).mockRejectedValue(new Error('refresh inválido'));

    // Act
    await expect(apiClient.get('/algo')).rejects.toThrow();

    // Assert
    expect(keycloak.logout).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('si el refresco funciona, reintenta la petición una vez', async () => {
    // Arrange
    const adapter = adapterConStatus(401);
    apiClient.defaults.adapter = adapter;
    vi.mocked(keycloak.updateToken).mockResolvedValue(true);

    // Act
    await expect(apiClient.get('/algo')).rejects.toThrow();

    // Assert
    expect(keycloak.logout).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(2);
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
    expect(keycloak.updateToken).not.toHaveBeenCalled();
    expect(adapter401).toHaveBeenCalledTimes(1);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
