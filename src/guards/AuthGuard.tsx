import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import { keycloak, scheduleRefresh } from '../keycloak';
import { useAuthStore } from '../stores/authStore';
import AppLoader from '../shared/components/AppLoader';
import { initDevAuth } from '../dev/devAuth';

/**
 * AuthGuard — layout route element that:
 * 1. Initialises Keycloak once (StrictMode-safe via useRef flag).
 * 2. Shows <AppLoader /> until keycloak.init() resolves.
 * 3. On success: populates the auth store atomically and starts proactive refresh.
 * 4. On failure: clears isInitializing so the user sees an error state (not blank).
 *
 * Uses onLoad: 'login-required' — unauthenticated users are redirected to Keycloak
 * before the React tree renders, so there is no "redirect back from guard" loop.
 */
export default function AuthGuard() {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const initRef = useRef(false);

  useEffect(() => {
    // StrictMode mounts/unmounts twice — this ref prevents a second init() call.
    if (initRef.current) return;
    initRef.current = true;

    // Dev bypass: omite Keycloak e inyecta un usuario ficticio desde .env.development.
    if (import.meta.env.VITE_AUTH_BYPASS === 'true') {
      initDevAuth();
      return;
    }

    let cleanup: (() => void) | undefined;

    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then(async (authenticated) => {
        if (authenticated) {
          const profile = await keycloak.loadUserProfile().catch(() => ({} as Record<string, unknown>));
          // Single atomic setState to prevent intermediate renders with partial auth state.
          useAuthStore.getState().setAuth({
            authenticated: true,
            token: keycloak.token,
            tokenParsed: keycloak.tokenParsed,
            username:
              (keycloak.tokenParsed?.['preferred_username'] as string | undefined) ??
              (profile?.['username'] as string | undefined) ??
              '',
          });
          cleanup = scheduleRefresh(
            (token) =>
              useAuthStore.setState({ token, tokenParsed: keycloak.tokenParsed }),
            () => keycloak.logout({ redirectUri: window.location.origin }),
          );
        } else {
          useAuthStore.getState().setInitializing(false);
        }
      })
      .catch(() => {
        // Keycloak server unreachable — clear initialising so UI can show an error.
        useAuthStore.getState().setInitializing(false);
      });

    return () => cleanup?.();
  }, []);

  if (isInitializing) return <AppLoader />;
  return <Outlet />;
}
