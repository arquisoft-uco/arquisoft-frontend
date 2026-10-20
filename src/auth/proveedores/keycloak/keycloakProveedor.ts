import apiClient from '../../../api/axiosInstance';
import { monitoring } from '../../../shared/utils/monitoring';
import { keycloak, scheduleRefresh, logout } from '../../keycloak';
import type { ProveedorIdentidad, SesionRestaurada } from '../proveedor';

const ID_KEYCLOAK = 'keycloak';
const LOGOUT_TIMEOUT_MS = 5000;

export function crearKeycloakProveedor(): ProveedorIdentidad {
  let inicializacion: Promise<boolean> | null = null;
  let notificar: ((sesion: SesionRestaurada) => void) | null = null;
  let cancelarRefresco: (() => void) | null = null;

  const sesionActual = (): SesionRestaurada => ({
    token: keycloak.token,
    tokenParsed: keycloak.tokenParsed ?? {},
    username: (keycloak.tokenParsed?.['preferred_username'] as string | undefined) ?? '',
  });

  // keycloak.init() solo puede llamarse una vez por instancia: las llamadas siguientes reutilizan su resultado.
  const inicializar = (): Promise<boolean> => {
    inicializacion ??= keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256',
      scope: 'openid',
    });
    return inicializacion;
  };

  return {
    id: ID_KEYCLOAK,

    async restaurarSesion(alActualizar) {
      notificar = alActualizar;
      const autenticado = await inicializar();
      if (!autenticado) return null;
      cancelarRefresco?.();
      cancelarRefresco = scheduleRefresh(
        () => notificar?.(sesionActual()),
        () => logout(),
      );
      return sesionActual();
    },

    iniciarSesion(destino) {
      void keycloak.login({ redirectUri: destino });
    },

    // La revocación en el backend es best-effort: el cierre local nunca depende de su respuesta.
    // No se llama keycloak.clearToken(): con login-required dispararía un login que compite con el end-session.
    async cerrarSesion(redirectUri) {
      cancelarRefresco?.();
      try {
        await apiClient.post('/auth/logout', undefined, {
          timeout: LOGOUT_TIMEOUT_MS,
          _omitirManejoAuth: true,
        });
      } catch (error) {
        monitoring.captureError(error instanceof Error ? error : new Error(String(error)), {
          context: 'backend-logout',
        });
      } finally {
        logout(redirectUri);
      }
    },

    credencialesHttp() {
      return { bearer: keycloak.token };
    },

    async renovarSesion() {
      try {
        await keycloak.updateToken(-1);
        if (keycloak.token) notificar?.(sesionActual());
        return true;
      } catch {
        void keycloak.logout({ redirectUri: window.location.origin });
        return false;
      }
    },
  };
}
