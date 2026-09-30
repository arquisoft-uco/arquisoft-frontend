import type { Rol } from '../../../shared/models/rol';

export interface ModificarUsuarioRequest {
  identificador?: string;
  nombre?: string;
  email?: string;
  contacto?: string;
  roles?: Rol[];
}
