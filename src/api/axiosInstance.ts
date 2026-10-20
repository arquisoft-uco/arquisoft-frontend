import axios from 'axios';
import { useAuthStore } from '../auth/authStore';
import { proveedorActivo } from '../auth/proveedores/proveedorActivo';
import { API_URL } from '../config/env';
import { monitoring } from '../shared/utils/monitoring';

declare module 'axios' {
  interface AxiosRequestConfig {
    // Peticiones que no deben refrescar token, reintentar ni navegar a /forbidden (p. ej. el logout)
    _omitirManejoAuth?: boolean;
  }
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: credenciales del proveedor activo ───────────────────
// Sin proveedor (bypass de desarrollo) se usa el token del store. getState(), no un hook:
// el interceptor corre fuera del árbol de React.
apiClient.interceptors.request.use((config) => {
  const proveedor = proveedorActivo();
  const credenciales = proveedor
    ? proveedor.credencialesHttp()
    : { bearer: useAuthStore.getState().token };
  if (credenciales.bearer) {
    config.headers['Authorization'] = `Bearer ${credenciales.bearer}`;
  }
  if (credenciales.conCookies) {
    config.withCredentials = true;
    if (credenciales.nombreCookieCsrf && credenciales.nombreCabeceraCsrf) {
      config.xsrfCookieName = credenciales.nombreCookieCsrf;
      config.xsrfHeaderName = credenciales.nombreCabeceraCsrf;
      config.withXSRFToken = true;
    }
  }
  return config;
});

// ── Response interceptor: refresh mutex + error routing ──────────────────────
// Single shared promise prevents concurrent 401s from triggering multiple refreshes.
let refreshPromise: Promise<boolean> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const config = error.config as typeof error.config & { _retry?: boolean };

    if (config?._omitirManejoAuth) {
      monitoring.captureHttpError(status, config.url, config.method);
      return Promise.reject(error);
    }

    const proveedor = proveedorActivo();
    if (status === 401 && config && !config._retry && proveedor) {
      config._retry = true;
      if (!refreshPromise) {
        refreshPromise = proveedor
          .renovarSesion()
          .catch(() => false)
          .finally(() => {
            refreshPromise = null;
          });
      }
      const refrescado = await refreshPromise;
      // Sin refresco no se reintenta: reenviar credenciales inválidas solo genera otro 401.
      if (!refrescado) return Promise.reject(error);
      return apiClient(config);
    }

    if (status === 403) {
      // router is imported lazily to avoid circular deps — use dynamic import
      import('../router').then(({ router }) => router.navigate('/forbidden'));
    }

    monitoring.captureHttpError(status, config?.url, config?.method);

    return Promise.reject(error);
  },
);

export default apiClient;
