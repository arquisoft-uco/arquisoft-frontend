import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useRolActivo, useRolesDisponibles } from '../hooks/useAuth';
import AccesoDenegado from '../shared/components/AccesoDenegado';
import type { Rol } from '../shared/models/rol';

interface Props {
  roles: Rol[];
  children: ReactNode;
}

export default function RoleGuard({ roles, children }: Props) {
  const rolActivo = useRolActivo();
  const rolesDisponibles = useRolesDisponibles();

  if (roles.length === 0) return <>{children}</>;

  // Guard only fires after auth hydration (AuthGuard already ensured isInitializing=false).
  if (rolesDisponibles.length > 0 && rolActivo === null) {
    return <Navigate to="/seleccionar-rol" replace />;
  }

  if (rolActivo && roles.includes(rolActivo)) return <>{children}</>;

  return <AccesoDenegado />;
}
