/// <reference types="vite/client" />

interface ImportMetaEnv {
  // ── API ────────────────────────────────────────────────────────────────────
  /** URL base del backend. Ej: http://localhost:8080/api */
  readonly VITE_API_URL: string;

  // ── Keycloak ───────────────────────────────────────────────────────────────
  /** URL del servidor Keycloak. Ej: https://keycloak.arquisoft.duckdns.org/ */
  readonly VITE_KEYCLOAK_URL: string;
  /** Realm de Keycloak. Ej: arquisoft */
  readonly VITE_KEYCLOAK_REALM: string;
  /** Client ID registrado en Keycloak. Ej: angular-app */
  readonly VITE_KEYCLOAK_CLIENT_ID: string;

  // ── Security Baseline (opcionales; las tres van juntas) ────────────────────
  /** Origen del PDP/BFF de Security Baseline. Si falta, el proveedor PDP no está disponible. */
  readonly VITE_PDP_URL?: string;
  /** URL del módulo ESM de Security UI. Requerida si VITE_PDP_URL está definida. */
  readonly VITE_SECURITY_UI_URL?: string;
  /** Nombre de esta aplicación en el catálogo del PDP. Requerida si VITE_PDP_URL está definida. */
  readonly VITE_APPLICATION_NAME?: string;

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
