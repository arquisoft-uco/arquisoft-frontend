import { Rol } from '../../../shared/models/rol';
import type { Usuario } from '../models/Usuario';

export const ROLES_USUARIO: { rol: Rol; campo: keyof Usuario }[] = [
  { rol: Rol.Estudiante, campo: 'esEstudiante' },
  { rol: Rol.Asesor, campo: 'esAsesor' },
  { rol: Rol.AsesorFicha, campo: 'esAsesorFicha' },
  { rol: Rol.Coordinador, campo: 'esCoordinador' },
  { rol: Rol.RepresentanteComiteCurriculum, campo: 'esRepresentanteComite' },
  { rol: Rol.Administrador, campo: 'esAdministrador' },
];

export function rolesDeUsuario(usuario: Usuario): Rol[] {
  return ROLES_USUARIO.filter(({ campo }) => usuario[campo] === true).map(({ rol }) => rol);
}
