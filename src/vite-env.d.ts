/// <reference types="vite/client" />

interface ImportMetaEnv {
  // ── API ────────────────────────────────────────────────────────────────────
  /** URL base del backend. Ej: http://localhost:8082/api */
  readonly VITE_API_URL: string;

  // ── Keycloak ───────────────────────────────────────────────────────────────
  /** URL del servidor Keycloak. Ej: https://keycloak.arquisoft.duckdns.org/ */
  readonly VITE_KEYCLOAK_URL: string;
  /** Realm de Keycloak. Ej: arquisoft */
  readonly VITE_KEYCLOAK_REALM: string;
  /** Client ID registrado en Keycloak. Ej: angular-app */
  readonly VITE_KEYCLOAK_CLIENT_ID: string;

  // ── Dev bypass ────────────────────────────────────────────────────────────
  /** Activa el bypass de Keycloak en desarrollo. Valor: 'true' | 'false' */
  readonly VITE_AUTH_BYPASS: string;
  /** Nombre de usuario ficticio inyectado cuando el bypass está activo. */
  readonly VITE_DEV_USERNAME: string;
  /** Roles separados por coma inyectados cuando el bypass está activo. */
  readonly VITE_DEV_ROLES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
