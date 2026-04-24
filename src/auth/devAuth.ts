import type { KeycloakTokenParsed } from 'keycloak-js';
import { useAuthStore } from './authStore';

/**
 * Inyecta un estado de autenticación ficticio en el store cuando
 * VITE_AUTH_BYPASS=true. No toca Keycloak: seguro para dev local sin servidor.
 *
 * Los roles se toman de VITE_DEV_ROLES (comma-separated) y deben coincidir
 * con los valores del enum Rol. Cualquier rol no reconocido se ignora en
 * useRolesDisponibles(), igual que con un token JWT real.
 */
export function initDevAuth(): void {
  const username = import.meta.env.VITE_DEV_USERNAME || 'dev-user';
  const rolesRaw = import.meta.env.VITE_DEV_ROLES || 'estudiante';
  const roles = rolesRaw
    .split(',')
    .map((r: string) => r.trim())
    .filter(Boolean);

  // El tokenParsed se construye con la misma estructura que parseRoles() espera.
  const tokenParsed = {
    sub: 'dev-bypass-user-id',
    preferred_username: username,
    resource_access: {
      [import.meta.env.VITE_KEYCLOAK_CLIENT_ID]: { roles },
    },
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  } as unknown as KeycloakTokenParsed;

  useAuthStore.getState().setAuth({
    authenticated: true,
    token: 'dev-bypass-token',
    tokenParsed,
    username,
  });
}
