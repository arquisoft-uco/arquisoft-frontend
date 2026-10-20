import { create } from 'zustand';

export interface ClaimsSesion {
  sub?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  email?: string;
  realm_access?: { roles?: string[] };
  [clave: string]: unknown;
}

export function parseRoles(tokenParsed: ClaimsSesion | undefined): string[] {
  return tokenParsed?.realm_access?.roles ?? [];
}

interface AuthState {
  isInitializing: boolean;
  authenticated: boolean;
  token: string | undefined;
  tokenParsed: ClaimsSesion | undefined;
  username: string;
  setAuth: (payload: {
    authenticated: boolean;
    token: string | undefined;
    tokenParsed: ClaimsSesion | undefined;
    username: string;
  }) => void;
  setToken: (token: string, tokenParsed: ClaimsSesion | undefined) => void;
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

// Solo memoria, sin persist. Fuera del árbol de React se accede con useAuthStore.getState().
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
