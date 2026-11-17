import apiClient from '../../../api/axiosInstance';
import { PDP_CONFIG } from '../../../config/env';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import type { ProveedorIdentidad, SesionRestaurada } from '../proveedor';

const ID_PDP = 'pdp';
const PROVEEDOR_API = 'sesion-pdp';
const RUTA_SESION = '/api/v1/session';
const RUTA_PERFIL = '/usuarios/mi/perfil';
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

interface PerfilUsuarioResponse {
  roles: { id: string; nombre: string }[];
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

  // 403 y 422: sesión válida de un usuario sin perfil vigente; el resto se relanza (un 401 aquí no es «sin sesión»: evita el bucle de login).
  const consultarRolesDePerfil = async (): Promise<string[]> => {
    try {
      const { data } = await apiClient.get<PerfilUsuarioResponse>(RUTA_PERFIL, {
        _omitirManejoAuth: true,
      });
      return data.roles.map((rol) => rol.id);
    } catch (error) {
      if (isApiErrorWithStatus(error, 403) || isApiErrorWithStatus(error, 422)) return [];
      throw error;
    }
  };

  const consultarDatosSesion = async () => {
    try {
      const { data } = await consultarSesion();
      return data.data;
    } catch (error) {
      if (isApiErrorWithStatus(error, 401)) return null;
      throw error;
    }
  };

  const sesionDePdp = async (): Promise<SesionRestaurada | null> => {
    const datos = await consultarDatosSesion();
    if (!datos) return null;
    const { subject, name, email } = datos;
    const roles = await consultarRolesDePerfil();
    return {
      tokenParsed: {
        sub: subject,
        preferred_username: email,
        email,
        name,
        realm_access: { roles },
      },
      username: email,
    };
  };

  const iniciarSesion = (destino: string) => {
    window.location.assign(`${url}${RUTA_LOGIN}?return_to=${encodeURIComponent(destino)}`);
  };

  return {
    id: ID_PDP,

    recuperarSesionSilenciosa: sesionDePdp,

    async restaurarSesion(): Promise<SesionRestaurada | null> {
      const sesion = await sesionDePdp();
      if (!sesion) iniciarSesion(window.location.href);
      return sesion;
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
