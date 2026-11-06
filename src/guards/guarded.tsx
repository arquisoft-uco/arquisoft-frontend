import type { ReactElement } from 'react';
import { CAPACIDAD_POR_RUTA, ROLES_POR_RUTA } from '../layout/nav-items';
import CapacidadGuard from './CapacidadGuard';
import RoleGuard from './RoleGuard';

export function guarded(path: string, element: ReactElement): ReactElement {
  const roles = ROLES_POR_RUTA[path];
  const capacidad = CAPACIDAD_POR_RUTA[path];
  const conRoles = roles ? <RoleGuard roles={roles}>{element}</RoleGuard> : element;
  return capacidad ? <CapacidadGuard capacidad={capacidad}>{conRoles}</CapacidadGuard> : conRoles;
}
