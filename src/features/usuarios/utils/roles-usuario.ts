import { Rol } from '../../../shared/models/rol';
import type { Usuario } from '../models/Usuario';

export const ROLES_USUARIO: { rol: Rol; campo: keyof Usuario }[] = [
  { rol: Rol.Estudiante, campo: 'esEstudiante' },
  { rol: Rol.Asesor, campo: 'esAsesor' },
  { rol: Rol.AsesorFicha, campo: 'esAsesorFicha' },
  { rol: Rol.Coordinador, campo: 'esCoordinador' },
  { rol: Rol.RepresentanteComiteCurriculum, campo: 'esRepresentanteComite' },
  { rol: Rol.Administrador, campo: 'esAdministrador' },
  { rol: Rol.Bibliotecario, campo: 'esBibliotecario' },
];

export const ROLES_FILTRABLES: { rol: Rol; etiqueta: string }[] = [
  { rol: Rol.Estudiante, etiqueta: 'Estudiantes' },
  { rol: Rol.Asesor, etiqueta: 'Asesores' },
  { rol: Rol.AsesorFicha, etiqueta: 'Asesores de ficha' },
  { rol: Rol.Coordinador, etiqueta: 'Coordinadores' },
  { rol: Rol.RepresentanteComiteCurriculum, etiqueta: 'Comité' },
  { rol: Rol.Administrador, etiqueta: 'Administradores' },
];

export function rolesDeUsuario(usuario: Usuario): Rol[] {
  return ROLES_USUARIO.filter(({ campo }) => usuario[campo] === true).map(({ rol }) => rol);
}
