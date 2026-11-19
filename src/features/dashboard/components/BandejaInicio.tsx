import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import SeccionInicio from './SeccionInicio';

interface Vacio {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

interface Props {
  titulo: string;
  nombre: string;
  verTodos?: { etiqueta: string; destino: string };
  cargado: boolean;
  hayError: boolean;
  reintentar: () => void;
  vacia: boolean;
  vacio: Vacio;
  children: ReactNode;
}

export default function BandejaInicio({
  titulo,
  nombre,
  verTodos,
  cargado,
  hayError,
  reintentar,
  vacia,
  vacio,
  children,
}: Props) {
  const enlace =
    verTodos && cargado && !vacia ? (
      <Link
        to={verTodos.destino}
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline sm:min-h-0"
      >
        {verTodos.etiqueta}
      </Link>
    ) : undefined;

  return (
    <SeccionInicio titulo={titulo} accion={enlace}>
      {hayError ? (
        <ErrorState titulo={`No pudimos cargar ${nombre}`} onReintentar={reintentar} />
      ) : !cargado ? (
        <Skeleton variante="tarjetas" etiqueta={`Cargando ${nombre}…`} />
      ) : vacia ? (
        <EmptyState {...vacio} />
      ) : (
        children
      )}
    </SeccionInicio>
  );
}
