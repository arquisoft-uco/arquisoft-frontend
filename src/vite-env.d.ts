/// <reference types="vite/client" />

interface ImportMetaEnv {
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
