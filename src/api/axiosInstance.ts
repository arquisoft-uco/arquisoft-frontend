import axios from 'axios';
import { useAuthStore } from '../auth/authStore';
import { keycloak } from '../auth/keycloak';
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

// ── Request interceptor: attach Bearer token ─────────────────────────────────
// Uses Zustand's getState() — NOT useContext() — so it works outside the React tree.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
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

    if (status === 401 && config && !config._retry) {
      config._retry = true;
      if (!refreshPromise) {
        refreshPromise = keycloak
          .updateToken(-1)
          .then(() => {
            if (keycloak.token) {
              useAuthStore.setState({ token: keycloak.token, tokenParsed: keycloak.tokenParsed });
            }
            return true;
          })
          .catch(() => {
            keycloak.logout({ redirectUri: window.location.origin });
            return false;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const refrescado = await refreshPromise;
      // Sin refresco no se reintenta: el redirect al logout ya está en curso y reenviar el token inválido solo genera otro 401.
      if (!refrescado) return Promise.reject(error);
      if (config.headers && keycloak.token) {
        config.headers['Authorization'] = `Bearer ${keycloak.token}`;
      }
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
