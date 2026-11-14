import apiClient from '../../../api/axiosInstance';
import { PDP_CONFIG } from '../../../config/env';
import { Rol } from '../../../shared/models/rol';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import type { ProveedorIdentidad, SesionRestaurada } from '../proveedor';

const ID_PDP = 'pdp';
const PROVEEDOR_API = 'sesion-pdp';
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

// Temporal hasta que el backend exponga «mi perfil» (B10 de docs/pendientes.md): solo UI, la autorización real es del PEP; para retirarlo, borra esta función y su llamada en restaurarSesion.
function rolesMockPdp(): string[] {
  return import.meta.env.DEV ? Object.values(Rol) : [];
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
      _omitirProveedorApi: true,
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
          // Pendiente: b) los roles vendrán del endpoint «mi perfil»; mientras tanto los provee rolesMockPdp.
          tokenParsed: {
            sub: subject,
            preferred_username: email,
            email,
            name,
            realm_access: { roles: rolesMockPdp() },
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
        proveedorApi: PROVEEDOR_API,
        conCookies: true,
        nombreCookieCsrf: NOMBRE_COOKIE_CSRF,
        nombreCabeceraCsrf: NOMBRE_CABECERA_CSRF,
      };
    },

    // 200: la sesión sigue viva y la API acepta la cookie, así que el 401 fue la caducidad del token del BFF; el interceptor reintenta una sola vez (_retry).
    async renovarSesion() {
      try {
        await consultarSesion();
        return true;
      } catch (error) {
        if (isApiErrorWithStatus(error, 401)) iniciarSesion(window.location.href);
        return false;
      }
    },
  };
}
