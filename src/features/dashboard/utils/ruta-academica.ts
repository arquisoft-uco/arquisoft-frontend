import type { LucideIcon } from 'lucide-react';
import { NAV_ITEMS, estaDisponible } from '../../../layout/nav-items';
import { Rol } from '../../../shared/models/rol';

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

export function pasosRutaAcademica(): PasoRutaAcademica[] {
  return RUTAS_ACADEMICAS.flatMap((path) => {
    const item = NAV_ITEMS.find((i) => i.path === path);
    return item
      ? [
          {
            path,
            label: item.label,
            icon: item.icon,
            disponible: estaDisponible(item) && (item.roles?.includes(Rol.Estudiante) ?? true),
          },
        ]
      : [];
  });
}
