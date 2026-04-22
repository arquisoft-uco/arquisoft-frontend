import Keycloak from 'keycloak-js';
import { environment } from './environments/environment';

/** Seconds before expiry at which the proactive refresh fires. */
const REFRESH_BUFFER_SECONDS = 30;

/**
 * Module-level singleton — created ONCE, never inside a hook or component.
 * React StrictMode double-mounts components but module-level code runs only once.
 */
export const keycloak = new Keycloak({
  url: environment.keycloak.url,
  realm: environment.keycloak.realm,
  clientId: environment.keycloak.clientId,
});

/**
 * Proactive token refresh: fires REFRESH_BUFFER_SECONDS before expiry,
 * matching the Angular implementation's strategy (not `onTokenExpired`).
 *
 * @param onRefresh - called after a successful refresh with the new token
 * @param onLogout  - called when refresh fails permanently
 * @returns cleanup function to cancel the pending timeout
 */
export function scheduleRefresh(
  onRefresh: (token: string) => void,
  onLogout: () => void,
): () => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  const schedule = () => {
    clearTimeout(timeoutId);

    const exp = keycloak.tokenParsed?.['exp'] as number | undefined;
    if (!exp) return;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const msUntilRefresh = Math.max((exp - nowSeconds - REFRESH_BUFFER_SECONDS) * 1000, 0);

    timeoutId = setTimeout(async () => {
      if (document.visibilityState === 'hidden') {
        document.addEventListener('visibilitychange', schedule, { once: true });
        return;
      }

      try {
        const refreshed = await keycloak.updateToken(REFRESH_BUFFER_SECONDS);
        if (refreshed && keycloak.token) {
          onRefresh(keycloak.token);
        }
        schedule();
      } catch {
        onLogout();
      }
    }, msUntilRefresh);
  };

  schedule();
  return () => clearTimeout(timeoutId);
}
