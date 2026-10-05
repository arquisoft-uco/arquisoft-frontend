import { ListChecks } from 'lucide-react';
import { useEstadosEvaluacion } from '../../hooks/useEstadosEvaluacion';
import Badge from '../../../../shared/components/ui/Badge';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';

export default function EstadosEvaluacionPanel() {
  const { data: estados = [], isLoading, isError, refetch } = useEstadosEvaluacion();

  if (isLoading) {
    return <Skeleton variante="tarjetas" etiqueta="Cargando estados de evaluación..." />;
  }

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los estados de evaluación"
        descripcion="Inténtalo nuevamente."
        onReintentar={refetch}
      />
    );
  }

  if (estados.length === 0) {
    return <EmptyState icono={ListChecks} titulo="No hay estados de evaluación registrados" />;
  }

  return (
    <div className="space-y-2" aria-label="Estados disponibles para evaluaciones">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-on-surface-secondary">
        Estados disponibles
      </h4>
      {estados.map((estado) => (
        <div
          key={estado.id}
          className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-surface p-3"
        >
          <Badge variante={varianteEstadoEvaluacion(estado.id)} className="shrink-0">
            {estado.nombre}
          </Badge>
          <p className="flex-1 text-xs text-on-surface-secondary">{estado.descripcion}</p>
        </div>
      ))}
    </div>
  );
}
