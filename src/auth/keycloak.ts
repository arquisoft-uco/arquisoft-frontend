import Keycloak from 'keycloak-js';
import { KEYCLOAK_CONFIG } from '../config/env';

/** Seconds before expiry at which the proactive refresh fires. */
const REFRESH_BUFFER_SECONDS = 30;

/**
 * Constructs the OIDC end-session URL and redirects the browser.
 *
 * keycloak.logout() is async (v21+) and requires id_token_hint to fully
 * terminate the Keycloak SSO session. Without it, the session stays alive
 * and keycloak.init({ onLoad: 'login-required' }) silently re-authenticates
 * the user on the next load.
 *
 * When there is no id_token (openid scope not requested), we fall back to
 * the client_id parameter, which Keycloak 18+ accepts for public clients.
 */
export function logout(redirectUri: string = window.location.origin): void {
  const base = KEYCLOAK_CONFIG.url.replace(/\/$/, '');
  const url = new URL(`${base}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout`);
  url.searchParams.set('post_logout_redirect_uri', redirectUri);
  if (keycloak.idToken) {
    url.searchParams.set('id_token_hint', keycloak.idToken);
  } else {
    url.searchParams.set('client_id', KEYCLOAK_CONFIG.clientId);
  }
  window.location.href = url.href;
}

/**
 * Module-level singleton — created ONCE, never inside a hook or component.
 * React StrictMode double-mounts components but module-level code runs only once.
 */
export const keycloak = new Keycloak({
  url: KEYCLOAK_CONFIG.url,
  realm: KEYCLOAK_CONFIG.realm,
  clientId: KEYCLOAK_CONFIG.clientId,
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
