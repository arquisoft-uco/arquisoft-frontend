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

// Cada HU de agregar rol habilita el suyo añadiendo una entrada aquí y un método de service.
export const ROLES_AGREGABLES: ReadonlySet<Rol> = new Set([
  Rol.Coordinador,
  Rol.Estudiante,
  Rol.Asesor,
  Rol.AsesorFicha,
  Rol.RepresentanteComiteCurriculum,
  Rol.Administrador,
  Rol.Bibliotecario,
]);

// Cada HU de quitar rol habilita el suyo añadiendo una entrada aquí y un método de service.
export const ROLES_QUITABLES: ReadonlySet<Rol> = new Set([
  Rol.Coordinador,
  Rol.Estudiante,
  Rol.Asesor,
  Rol.AsesorFicha,
  Rol.RepresentanteComiteCurriculum,
  Rol.Administrador,
  Rol.Bibliotecario,
]);

export const ROLES_DEL_PANEL: readonly Rol[] = [
  Rol.Estudiante,
  Rol.Asesor,
  Rol.AsesorFicha,
  Rol.Coordinador,
  Rol.RepresentanteComiteCurriculum,
  Rol.Administrador,
  Rol.Jurado,
  Rol.Bibliotecario,
];

// Sin Jurado: el backend aún no lo asigna al registrar (TODO HU250 en RegistrarUsuarioUseCaseImpl).
export const ROLES_REGISTRABLES: readonly Rol[] = ROLES_DEL_PANEL.filter((rol) =>
  ROLES_AGREGABLES.has(rol),
);

export const DESCRIPCIONES_ROL: Record<Rol, string> = {
  [Rol.Estudiante]: 'Tiene una ficha de perfil y puede enviar solicitudes.',
  [Rol.Asesor]: 'Acompaña proyectos de grado.',
  [Rol.AsesorFicha]: 'Revisa las fichas de perfil que le asignan.',
  [Rol.Coordinador]: 'Registra fichas y asigna estudiantes y asesores.',
  [Rol.RepresentanteComiteCurriculum]: 'Evalúa las fichas disponibles para evaluación.',
  [Rol.Administrador]: 'Gestiona usuarios, roles y acceso.',
  [Rol.Jurado]: 'Evalúa proyectos de grado.',
  [Rol.Bibliotecario]: 'Gestiona el material de la biblioteca.',
};

export function rolesDeUsuario(usuario: Usuario): Rol[] {
  return ROLES_USUARIO.filter(({ campo }) => usuario[campo] === true).map(({ rol }) => rol);
}

export function puedeCambiarRol(rol: Rol, asignado: boolean): boolean {
  return (asignado ? ROLES_QUITABLES : ROLES_AGREGABLES).has(rol);
}
