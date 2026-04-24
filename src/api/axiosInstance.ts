import axios from 'axios';
import { useAuthStore } from '../auth/authStore';
import { keycloak } from '../auth/keycloak';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const config = error.config as typeof error.config & { _retry?: boolean };

    if (status === 401 && config && !config._retry) {
      config._retry = true;
      if (!refreshPromise) {
        refreshPromise = keycloak
          .updateToken(-1)
          .then(() => {
            if (keycloak.token) {
              useAuthStore.setState({ token: keycloak.token, tokenParsed: keycloak.tokenParsed });
            }
          })
          .catch(async () => {
            keycloak.logout({ redirectUri: window.location.origin });
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      await refreshPromise;
      if (config.headers && keycloak.token) {
        config.headers['Authorization'] = `Bearer ${keycloak.token}`;
      }
      return apiClient(config);
    }

    if (status === 403) {
      // router is imported lazily to avoid circular deps — use dynamic import
      import('../router').then(({ router }) => router.navigate('/forbidden'));
    }

    // Log minimal info — never the full error.config (which contains the JWT)
    console.error('[apiClient]', { status, url: config?.url, method: config?.method });

    return Promise.reject(error);
  },
);

export default apiClient;
