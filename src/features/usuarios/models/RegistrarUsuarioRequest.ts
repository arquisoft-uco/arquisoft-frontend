import type { Rol } from '../../../shared/models/rol';

export interface RegistrarUsuarioRequest {
  identificador: string;
  nombres: string;
  apellidos: string;
  email: string;
  contacto: string;
  roles?: Rol[];
}
