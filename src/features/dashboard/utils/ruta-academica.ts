import type { LucideIcon } from 'lucide-react';
import { NAV_ITEMS, estaDisponible, navItemsDelRol } from '../../../layout/nav-items';
import type { Rol } from '../../../shared/models/rol';

const RUTAS_ACADEMICAS = [
  '/fichas-perfil',
  '/proyectos-grado',
  '/artefactos',
  '/entregables',
  '/evaluaciones',
  '/biblioteca',
];

export interface PasoRutaAcademica {
  path: string;
  label: string;
  icon: LucideIcon;
  disponible: boolean;
}

export function pasosRutaAcademica(rol: Rol): PasoRutaAcademica[] {
  const rutasDelRol = new Set(navItemsDelRol(rol).map((i) => i.path));
  return RUTAS_ACADEMICAS.flatMap((path) => {
    const item = NAV_ITEMS.find((i) => i.path === path);
    return item
      ? [
          {
            path,
            label: item.label,
            icon: item.icon,
            disponible: estaDisponible(item) && rutasDelRol.has(path),
          },
        ]
      : [];
  });
}
