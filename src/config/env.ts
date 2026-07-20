/**
 * Centralised env-var access with fail-fast validation.
 *
 * Evaluated once at module load time — any missing required variable throws
 * immediately with a clear message before Keycloak or Axios are initialised.
 *
 * Import this module FIRST in main.tsx so errors surface before React mounts.
 */

function requireEnv(name: string): string {
  const value = import.meta.env[name] as string | undefined;
  if (!value) {
    throw new Error(
      `[config] Variable de entorno requerida no definida: "${name}".\n` +
      `Copia .env.example a .env.development.local y completa los valores.`,
    );
  }
  return value;
}

// ── Producción: bloquear bypass de autenticación ─────────────────────────────
if (import.meta.env.PROD && import.meta.env.VITE_AUTH_BYPASS === 'true') {
  throw new Error(
    '[config] VITE_AUTH_BYPASS no puede ser "true" en un build de producción.',
  );
}

export const AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === 'true';

// ── API ───────────────────────────────────────────────────────────────────────
export const API_URL = requireEnv('VITE_API_URL');

// ── Keycloak (solo requerido cuando no se usa el bypass de desarrollo) ────────
export const KEYCLOAK_CONFIG = AUTH_BYPASS
  ? { url: '', realm: '', clientId: '' }
  : {
      url: requireEnv('VITE_KEYCLOAK_URL'),
      realm: requireEnv('VITE_KEYCLOAK_REALM'),
      clientId: requireEnv('VITE_KEYCLOAK_CLIENT_ID'),
    };
