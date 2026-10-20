import type { ClaimsSesion } from '../authStore';

export type ProveedorId = string;

export type Capacidad = 'administracion-seguridad';

export interface SesionRestaurada {
  token?: string;
  tokenParsed: ClaimsSesion;
  username: string;
}

export interface CredencialesHttp {
  bearer?: string;
  conCookies?: boolean;
  nombreCookieCsrf?: string;
  nombreCabeceraCsrf?: string;
}

export interface ProveedorIdentidad {
  readonly id: ProveedorId;
  restaurarSesion: (
    alActualizar: (sesion: SesionRestaurada) => void,
  ) => Promise<SesionRestaurada | null>;
  iniciarSesion: (destino: string) => void;
  cerrarSesion: (redirectUri: string) => Promise<void>;
  credencialesHttp: () => CredencialesHttp;
  renovarSesion: () => Promise<boolean>;
}

export interface DefinicionProveedor {
  id: ProveedorId;
  titulo: string;
  descripcion: string;
  capacidades: readonly Capacidad[];
  disponible: boolean;
  crear: () => ProveedorIdentidad;
}
