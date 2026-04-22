import type { LucideIcon } from 'lucide-react';
import {
  House,
  FileText,
  GraduationCap,
  Folder,
  Send,
  ClipboardCheck,
  Map,
  CloudUpload,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import { Rol } from '../shared/models/rol';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  order: number;
  roles?: string[];
}

/**
 * Roles that see the "general" modules (everything except role-specific restrictions).
 * AsesorFicha is excluded — they only see Fichas Perfil, Biblioteca, and Solicitudes.
 */
const ROLES_GENERALES = [
  Rol.Administrador,
  Rol.Asesor,
  Rol.Estudiante,
  Rol.Coordinador,
];

/**
 * Static nav item definitions — equivalent to Angular routes with navItem data.
 * Icons are React.ComponentType (not LucideIconData objects from lucide-angular).
 * Render with: const Icon = item.icon; return <Icon size={18} />;
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', icon: House, path: '/dashboard', order: 0 },
  { label: 'Fichas Perfil', icon: FileText, path: '/fichas-perfil', order: 1, roles: [Rol.Administrador, Rol.Coordinador, Rol.Estudiante, Rol.AsesorFicha, Rol.RepresentanteComiteCurriculum] },
  { label: 'Proyectos Grado', icon: GraduationCap, path: '/proyectos-grado', order: 2, roles: ROLES_GENERALES },
  { label: 'Artefactos', icon: Folder, path: '/artefactos', order: 3, roles: ROLES_GENERALES },
  { label: 'Entregables', icon: Send, path: '/entregables', order: 4, roles: [...ROLES_GENERALES, Rol.Jurado] },
  { label: 'Evaluaciones', icon: ClipboardCheck, path: '/evaluaciones', order: 5, roles: [...ROLES_GENERALES, Rol.Jurado] },
  { label: 'Mapas Ruta', icon: Map, path: '/mapas-ruta', order: 6, roles: ROLES_GENERALES },
  { label: 'Repositorio', icon: CloudUpload, path: '/repositorio-artefactos', order: 7, roles: ROLES_GENERALES },
  { label: 'Biblioteca', icon: BookOpen, path: '/biblioteca', order: 8, roles: [...ROLES_GENERALES, Rol.AsesorFicha, Rol.RepresentanteComiteCurriculum, Rol.Bibliotecario] },
  { label: 'Solicitudes', icon: ClipboardList, path: '/solicitudes', order: 9, roles: [...ROLES_GENERALES, Rol.AsesorFicha, Rol.RepresentanteComiteCurriculum, Rol.Jurado, Rol.Bibliotecario] },
];
