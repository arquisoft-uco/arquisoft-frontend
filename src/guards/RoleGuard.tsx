import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useRolActivo, useRolesDisponibles } from '../hooks/useAuth';
import type { Rol } from '../shared/models/rol';

interface Props {
  /** Roles allowed to access the wrapped content. Empty = no restriction. */
  roles: Rol[];
  children: ReactNode;
}

/**
 * RoleGuard — component wrapper for role-based access control.
 *
 * Behaviour matches Angular's roleGuard:
 * - No roles required → render children.
 * - rolActivo is null → redirect to /seleccionar-rol.
 * - rolActivo not in allowed roles → redirect to /forbidden.
 */
export default function RoleGuard({ roles, children }: Props) {
  const rolActivo = useRolActivo();
  const rolesDisponibles = useRolesDisponibles();

  if (roles.length === 0) return <>{children}</>;

  // Guard only fires after auth hydration (AuthGuard already ensured isInitializing=false).
  if (rolesDisponibles.length > 0 && rolActivo === null) {
    return <Navigate to="/seleccionar-rol" replace />;
  }

  if (rolActivo && roles.includes(rolActivo)) return <>{children}</>;

  return <Navigate to="/forbidden" replace />;
}
