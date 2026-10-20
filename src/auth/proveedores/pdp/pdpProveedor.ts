import apiClient from '../../../api/axiosInstance';
import { PDP_CONFIG } from '../../../config/env';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import type { ProveedorIdentidad, SesionRestaurada } from '../proveedor';

const ID_PDP = 'pdp';
const RUTA_SESION = '/api/v1/session';
const RUTA_LOGIN = '/oauth2/authorization/keycloak';
const RUTA_LOGOUT = '/api/v1/session/logout';
const NOMBRE_COOKIE_CSRF = 'XSRF-TOKEN';
const NOMBRE_CABECERA_CSRF = 'X-XSRF-TOKEN';

interface SesionPdpResponse {
  code: string;
  message: string;
  data: { subject: string; name: string; email: string; tenantId: string };
  timestamp: string;
  requestId: string;
  correlationId: string;
}

export function crearPdpProveedor(): ProveedorIdentidad {
  const configuracion = PDP_CONFIG;
  if (!configuracion) {
    throw new Error('[auth] El proveedor PDP no está configurado: define VITE_PDP_URL.');
  }
  const { url } = configuracion;

  const consultarSesion = () =>
    apiClient.get<SesionPdpResponse>(RUTA_SESION, {
      baseURL: url,
      withCredentials: true,
      _omitirManejoAuth: true,
    });

  const iniciarSesion = (destino: string) => {
    window.location.assign(`${url}${RUTA_LOGIN}?return_to=${encodeURIComponent(destino)}`);
  };

  return {
    id: ID_PDP,

    async restaurarSesion(): Promise<SesionRestaurada | null> {
      try {
        const { data } = await consultarSesion();
        const { subject, name, email } = data.data;
        return {
          // Pendiente: b) los roles vendrán del endpoint «mi perfil» del backend, aún inexistente.
          tokenParsed: {
            sub: subject,
            preferred_username: email,
            email,
            name,
            realm_access: { roles: [] },
          },
          username: email,
        };
      } catch (error) {
        if (isApiErrorWithStatus(error, 401)) {
          iniciarSesion(window.location.href);
          return null;
        }
        throw error;
      }
    },

    iniciarSesion,

    async cerrarSesion() {
      window.location.assign(`${url}${RUTA_LOGOUT}`);
    },

    credencialesHttp() {
      return {
        conCookies: true,
        nombreCookieCsrf: NOMBRE_COOKIE_CSRF,
        nombreCabeceraCsrf: NOMBRE_CABECERA_CSRF,
      };
    },

    // 200: la sesión del PDP sigue viva y el 401 viene de la API propia; no se redirige para evitar un bucle de logins.
    async renovarSesion() {
      try {
        await consultarSesion();
      } catch (error) {
        if (isApiErrorWithStatus(error, 401)) iniciarSesion(window.location.href);
      }
      return false;
    },
  };
}
