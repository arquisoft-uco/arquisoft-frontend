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

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  order: number;
  roles?: string[];
}

/**
 * Static nav item definitions — equivalent to Angular routes with navItem data.
 * Icons are React.ComponentType (not LucideIconData objects from lucide-angular).
 * Render with: const Icon = item.icon; return <Icon size={18} />;
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', icon: House, path: '/dashboard', order: 0 },
  { label: 'Fichas Perfil', icon: FileText, path: '/fichas-perfil', order: 1 },
  { label: 'Proyectos Grado', icon: GraduationCap, path: '/proyectos-grado', order: 2 },
  { label: 'Artefactos', icon: Folder, path: '/artefactos', order: 3 },
  { label: 'Entregables', icon: Send, path: '/entregables', order: 4 },
  { label: 'Evaluaciones', icon: ClipboardCheck, path: '/evaluaciones', order: 5 },
  { label: 'Mapas Ruta', icon: Map, path: '/mapas-ruta', order: 6 },
  { label: 'Repositorio', icon: CloudUpload, path: '/repositorio-artefactos', order: 7 },
  { label: 'Biblioteca', icon: BookOpen, path: '/biblioteca', order: 8 },
  { label: 'Solicitudes', icon: ClipboardList, path: '/solicitudes', order: 9 },
];
