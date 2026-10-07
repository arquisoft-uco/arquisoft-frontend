import apiClient from '../api/axiosInstance';
import { logout } from './keycloak';
import { useAuthStore } from './authStore';
import { useRoleStore } from './roleStore';
import { monitoring } from '../shared/utils/monitoring';

const LOGOUT_TIMEOUT_MS = 5000;

// La revocación en el backend es best-effort: el cierre local nunca depende de su respuesta.
// No se llama keycloak.clearToken(): con login-required dispararía un login que compite con el end-session.
export async function cerrarSesion(redirectUri: string = window.location.origin): Promise<void> {
  try {
    await apiClient.post('/auth/logout', undefined, {
      timeout: LOGOUT_TIMEOUT_MS,
      _omitirManejoAuth: true,
    });
  } catch (error) {
    monitoring.captureError(
      error instanceof Error ? error : new Error(String(error)),
      { context: 'backend-logout' },
    );
  } finally {
    useAuthStore.getState().reset();
    useRoleStore.getState().clearRolSeleccionado();
    logout(redirectUri);
  }
}
