import type { ReactNode } from 'react';
import type { Capacidad } from '../auth/proveedores/proveedor';
import { useCapacidades } from '../hooks/useAuth';
import AccesoDenegado from '../shared/components/AccesoDenegado';

interface Props {
  capacidad: Capacidad;
  children: ReactNode;
}

export default function CapacidadGuard({ capacidad, children }: Props) {
  const capacidades = useCapacidades();
  if (!capacidades.includes(capacidad)) return <AccesoDenegado />;
  return <>{children}</>;
}
