import { ListChecks } from 'lucide-react';
import { useEstadosDocumentacion } from '../hooks/useEstadosDocumentacion';
import Badge from '../../../shared/components/ui/Badge';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { varianteEstadoDocumentacion } from '../../../shared/utils/estado-variante';

export default function EstadosDocumentacionPanel() {
  const { data: estados = [], isLoading, isError, error, refetch } = useEstadosDocumentacion(true);

  if (isLoading) {
    return <Skeleton variante="tarjetas" etiqueta="Cargando estados de documentación…" />;
  }

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los estados de documentación"
        descripcion={getApiErrorMessage(error, 'Intenta nuevamente más tarde.')}
        onReintentar={refetch}
      />
    );
  }

  if (estados.length === 0) {
    return <EmptyState icono={ListChecks} titulo="No hay estados de documentación registrados" />;
  }

  return (
    <ul aria-label="Estados de una documentación" className="flex flex-col gap-3">
      {estados.map((estado) => (
        <li
          key={estado.id}
          className="flex flex-col items-start gap-2 rounded-xl border border-border p-3.5"
        >
          <Badge variante={varianteEstadoDocumentacion(estado.id)}>{estado.nombre}</Badge>
          <span className="text-sm break-words text-on-surface-secondary">
            {estado.descripcion}
          </span>
        </li>
      ))}
    </ul>
  );
}
