import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cerrarSesion } from './session';
import { useAuthStore } from './authStore';
import { useRoleStore } from './roleStore';
import apiClient from '../api/axiosInstance';
import { logout } from './keycloak';
import { Rol } from '../shared/models/rol';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../test-utils/store.utils';

vi.mock('../api/axiosInstance', () => ({ default: { post: vi.fn() } }));
vi.mock('./keycloak', () => ({ logout: vi.fn() }));
vi.mock('../shared/utils/monitoring', () => ({
  monitoring: { captureError: vi.fn(), captureHttpError: vi.fn() },
}));

const REDIRECT = 'http://localhost:5173';

describe('cerrarSesion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    setAuthenticatedUser();
    setActiveRole(Rol.Administrador);
  });

  it.each([
    ['401', { response: { status: 401 } }],
    ['403', { response: { status: 403 } }],
    ['error de red', new Error('Network Error')],
  ])('cierra la sesión local y redirige aunque el backend falle con %s', async (_caso, fallo) => {
    // Arrange
    vi.mocked(apiClient.post).mockRejectedValue(fallo);

    // Act
    await cerrarSesion(REDIRECT);

    // Assert
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(REDIRECT);
    expect(useAuthStore.getState().token).toBeUndefined();
    expect(useAuthStore.getState().authenticated).toBe(false);
    expect(useRoleStore.getState().rolSeleccionado).toBeNull();
  });

  it('revoca el token sin manejo de auth y con timeout antes de redirigir', async () => {
    // Arrange
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

    // Act
    await cerrarSesion(REDIRECT);

    // Assert
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', undefined, {
      timeout: 5000,
      _omitirManejoAuth: true,
    });
    expect(logout).toHaveBeenCalledWith(REDIRECT);
  });
});
