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
  Users,
} from 'lucide-react';
import { Rol } from '../shared/models/rol';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  order: number;
  roles?: Rol[];
  disponible?: boolean;
}

// Roles que ven los módulos generales; AsesorFicha queda fuera (solo Fichas, Biblioteca y Solicitudes).
const ROLES_GENERALES = [Rol.Administrador, Rol.Asesor, Rol.Estudiante, Rol.Coordinador];

// Definición estática del menú; un módulo con disponible: false aún no tiene pantalla.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', icon: House, path: '/dashboard', order: 0 },
  {
    label: 'Fichas Perfil',
    icon: FileText,
    path: '/fichas-perfil',
    order: 1,
    roles: [
      Rol.Administrador,
      Rol.Coordinador,
      Rol.Estudiante,
      Rol.AsesorFicha,
      Rol.RepresentanteComiteCurriculum,
    ],
  },
  {
    label: 'Proyectos Grado',
    icon: GraduationCap,
    path: '/proyectos-grado',
    order: 2,
    roles: ROLES_GENERALES,
    disponible: false,
  },
  {
    label: 'Artefactos',
    icon: Folder,
    path: '/artefactos',
    order: 3,
    roles: ROLES_GENERALES,
    disponible: false,
  },
  {
    label: 'Entregables',
    icon: Send,
    path: '/entregables',
    order: 4,
    roles: [...ROLES_GENERALES, Rol.Jurado],
    disponible: false,
  },
  {
    label: 'Evaluaciones',
    icon: ClipboardCheck,
    path: '/evaluaciones',
    order: 5,
    roles: [...ROLES_GENERALES, Rol.Jurado],
    disponible: false,
  },
  {
    label: 'Mapas Ruta',
    icon: Map,
    path: '/mapas-ruta',
    order: 6,
    roles: ROLES_GENERALES,
    disponible: false,
  },
  {
    label: 'Repositorio',
    icon: CloudUpload,
    path: '/repositorio-artefactos',
    order: 7,
    roles: ROLES_GENERALES,
    disponible: false,
  },
  {
    label: 'Biblioteca',
    icon: BookOpen,
    path: '/biblioteca',
    order: 8,
    roles: [
      ...ROLES_GENERALES,
      Rol.AsesorFicha,
      Rol.RepresentanteComiteCurriculum,
      Rol.Bibliotecario,
    ],
    disponible: false,
  },
  {
    label: 'Solicitudes',
    icon: ClipboardList,
    path: '/solicitudes',
    order: 9,
    roles: [
      ...ROLES_GENERALES,
      Rol.AsesorFicha,
      Rol.RepresentanteComiteCurriculum,
      Rol.Jurado,
      Rol.Bibliotecario,
    ],
  },
  { label: 'Usuarios', icon: Users, path: '/usuarios', order: 10, roles: [Rol.Administrador] },
];

// Ruta (sin barra inicial) → roles permitidos, derivada de todos los ítems; sin entrada = sin restricción.
export const ROLES_POR_RUTA: Record<string, Rol[]> = Object.fromEntries(
  NAV_ITEMS.filter((item) => item.roles).map((item) => [item.path.slice(1), item.roles!]),
);

export function estaDisponible(item: NavItem): boolean {
  return item.disponible !== false;
}

export function navItemsDelRol(rol: Rol | null, items: NavItem[] = NAV_ITEMS): NavItem[] {
  return items
    .filter((item) => !item.roles || (rol !== null && item.roles.includes(rol)))
    .sort((a, b) => a.order - b.order);
}

export function agruparNavItems(items: NavItem[]): {
  trabajo: NavItem[];
  proximamente: NavItem[];
} {
  return {
    trabajo: items.filter(estaDisponible),
    proximamente: items.filter((item) => !estaDisponible(item)),
  };
}
