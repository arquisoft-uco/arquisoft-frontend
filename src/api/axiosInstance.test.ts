import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import apiClient from './axiosInstance';
import { keycloak } from '../auth/keycloak';
import { router } from '../router';

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
    await expect(apiClient.post('/auth/logout', undefined, { _omitirManejoAuth: true })).rejects.toThrow();

    // Assert
    expect(keycloak.updateToken).not.toHaveBeenCalled();
    expect(keycloak.logout).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('con la bandera, un 403 no navega a /forbidden', async () => {
    // Arrange
    apiClient.defaults.adapter = adapterConStatus(403);

    // Act
    await expect(apiClient.post('/auth/logout', undefined, { _omitirManejoAuth: true })).rejects.toThrow();
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
