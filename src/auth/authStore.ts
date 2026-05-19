import { create } from 'zustand';
import type { KeycloakTokenParsed } from 'keycloak-js';

/** Extracts roles from the Keycloak token's realm_access claim. */
export function parseRoles(tokenParsed: KeycloakTokenParsed | undefined): string[] {
  const realmAccess = tokenParsed?.['realm_access'] as { roles?: string[] } | undefined;
  return realmAccess?.roles ?? [];
}

interface AuthState {
  /** True while keycloak.init() has not yet resolved. Guards render <AppLoader />. */
  isInitializing: boolean;
  authenticated: boolean;
  token: string | undefined;
  tokenParsed: KeycloakTokenParsed | undefined;
  username: string;
  // Actions
  setAuth: (payload: {
    authenticated: boolean;
    token: string | undefined;
    tokenParsed: KeycloakTokenParsed | undefined;
    username: string;
  }) => void;
  setToken: (token: string, tokenParsed: KeycloakTokenParsed | undefined) => void;
  setInitializing: (value: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  isInitializing: true,
  authenticated: false,
  token: undefined,
  tokenParsed: undefined,
  username: '',
} satisfies Omit<AuthState, 'setAuth' | 'setToken' | 'setInitializing' | 'reset'>;

/**
 * Auth store — IN-MEMORY ONLY, no persist middleware.
 * Raw JWT and tokenParsed stay in the Keycloak adapter; only derived data lives here.
 *
 * Access outside the React tree via useAuthStore.getState() (e.g., Axios interceptors).
 */
export const useAuthStore = create<AuthState>()((set) => ({
  ...INITIAL_STATE,
  setAuth: (payload) =>
    set({
      isInitializing: false,
      authenticated: payload.authenticated,
      token: payload.token,
      tokenParsed: payload.tokenParsed,
      username: payload.username,
    }),
  setToken: (token, tokenParsed) => set({ token, tokenParsed }),
  setInitializing: (value) => set({ isInitializing: value }),
  reset: () => set(INITIAL_STATE),
}));

export const getInitialAuthState = () => ({ ...INITIAL_STATE });
