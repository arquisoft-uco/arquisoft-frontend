import type { ClaimsSesion } from './authStore';
import { useAuthStore } from './authStore';

// Con VITE_AUTH_BYPASS=true inyecta un usuario ficticio sin tocar ningún proveedor de identidad.
// Los roles salen de VITE_DEV_ROLES (separados por coma) y deben coincidir con el enum Rol.
export function initDevAuth(): void {
  const username = import.meta.env.VITE_DEV_USERNAME || 'dev-user';
  const rolesRaw = import.meta.env.VITE_DEV_ROLES || 'estudiante';
  const roles = rolesRaw
    .split(',')
    .map((r: string) => r.trim())
    .filter(Boolean);

  const tokenParsed: ClaimsSesion = {
    sub: '0ea42337-9899-4190-a7ad-9c0f319151f8',
    preferred_username: username,
    realm_access: { roles },
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  useAuthStore.getState().setAuth({
    authenticated: true,
    token: 'dev-bypass-token',
    tokenParsed,
    username,
  });
}
