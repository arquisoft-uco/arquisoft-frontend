import { useEstadosEvaluacion } from '../../hooks/useEstadosEvaluacion';
import Badge from '../../../../shared/components/ui/Badge';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';

export default function EstadosEvaluacionPanel() {
  const { data: estados = [], isLoading, isError } = useEstadosEvaluacion();

  if (isLoading) {
    return <Skeleton variante="tarjetas" etiqueta="Cargando estados de evaluación..." />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-center" role="alert">
        <p className="text-sm text-on-surface-secondary">
          No se pudieron cargar los estados de evaluación. Intenta nuevamente.
        </p>
      </div>
    );
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
