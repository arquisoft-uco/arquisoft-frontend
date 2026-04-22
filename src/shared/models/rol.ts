import type { LucideIcon } from 'lucide-react';
import {
  ShieldCheck,
  UserPen,
  UserCheck,
  GraduationCap,
  Scale,
  Briefcase,
  Library,
  BookMarked,
} from 'lucide-react';

/**
 * Roles recognised by the system.
 * Values match the roles configured in the Keycloak client.
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

/** Lucide React component icons for each role — LucideIcon, not LucideIconData */
export const ICONOS_ROL: Record<Rol, LucideIcon> = {
  [Rol.Administrador]: ShieldCheck,
  [Rol.Asesor]: UserPen,
  [Rol.AsesorFicha]: UserCheck,
  [Rol.Estudiante]: GraduationCap,
  [Rol.Jurado]: Scale,
  [Rol.Coordinador]: Briefcase,
  [Rol.Bibliotecario]: Library,
  [Rol.RepresentanteComiteCurriculum]: BookMarked,
};
