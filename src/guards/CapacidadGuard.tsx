import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import type { Capacidad } from '../auth/proveedores/proveedor';
import { useCapacidades } from '../hooks/useAuth';

interface Props {
  capacidad: Capacidad;
  children: ReactNode;
}

export default function CapacidadGuard({ capacidad, children }: Props) {
  const capacidades = useCapacidades();
  if (!capacidades.includes(capacidad)) return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
}
