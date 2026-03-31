import type { LucideIconData } from 'lucide-angular';
import {
  ShieldCheck, UserPen, UserCheck, GraduationCap, Scale,
  Briefcase, Library, BookMarked,
} from 'lucide-angular';

/**
 * Roles de usuario reconocidos por el sistema.
 * Los valores coinciden con los roles configurados en el cliente de Keycloak.
 */
export enum Rol {
  Administrador = 'administrador',
  Asesor = 'asesor',
  AsesorFicha = 'asesor_ficha',
  Estudiante = 'estudiante',
  Jurado = 'jurado',
  Coordinador = 'coordinador',
  Bibliotecario = 'bibliotecario',
  RepresentanteComiteCurriculum = 'representante_comite_curriculum',
}

/** Etiquetas en español para mostrar en la interfaz */
export const ETIQUETAS_ROL: Record<Rol, string> = {
  [Rol.Administrador]: 'Administrador',
  [Rol.Asesor]: 'Asesor',
  [Rol.AsesorFicha]: 'Asesor de Ficha',
  [Rol.Estudiante]: 'Estudiante',
  [Rol.Jurado]: 'Jurado',
  [Rol.Coordinador]: 'Coordinador',
  [Rol.Bibliotecario]: 'Bibliotecario',
  [Rol.RepresentanteComiteCurriculum]: 'Representante del Comité de Currículum',
};

/** Iconos de Lucide para cada rol */
export const ICONOS_ROL: Record<Rol, LucideIconData> = {
  [Rol.Administrador]: ShieldCheck,
  [Rol.Asesor]: UserPen,
  [Rol.AsesorFicha]: UserCheck,
  [Rol.Estudiante]: GraduationCap,
  [Rol.Jurado]: Scale,
  [Rol.Coordinador]: Briefcase,
  [Rol.Bibliotecario]: Library,
  [Rol.RepresentanteComiteCurriculum]: BookMarked,
};
