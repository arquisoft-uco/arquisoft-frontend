import apiClient from '../api/axiosInstance';
import { logout } from './keycloak';
import { monitoring } from '../shared/utils/monitoring';

/**
 * Cierre de sesión iniciado por el usuario.
 *
 * Orden importante:
 * 1. Revoca el access token en el backend (POST /auth/logout) MIENTRAS sigue
 *    siendo válido. El backend agrega el JTI a la blacklist de Redis con TTL =
 *    tiempo restante del token, de modo que el resource-server lo rechaza aunque
 *    aún no haya expirado.
 * 2. Cierra la sesión SSO en Keycloak (end-session con id_token_hint), lo que
 *    dispara un redirect de página completa.
 *
 * El paso 1 es best-effort: si falla (red caída, token ya expirado → 401), se
 * registra y se continúa igualmente al end-session para no dejar al usuario
 * atrapado en una sesión que quiere cerrar.
 */
export async function cerrarSesion(redirectUri: string = window.location.origin): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    monitoring.captureError(
      error instanceof Error ? error : new Error(String(error)),
      { context: 'backend-logout' },
    );
  } finally {
    logout(redirectUri);
  }
}
