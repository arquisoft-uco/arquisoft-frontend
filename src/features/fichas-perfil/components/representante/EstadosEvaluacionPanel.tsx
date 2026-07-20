import { useEstadosEvaluacion } from '../../hooks/useEstadosEvaluacion';

const BADGE_COLORS: Record<string, string> = {
  'Aprobada': 'bg-green-100 text-green-800',
  'Aprobada Con Observaciones': 'bg-yellow-100 text-yellow-800',
  'No Aprobada': 'bg-red-100 text-red-800',
  'En Evaluación': 'bg-blue-100 text-blue-800',
  'Descartada': 'bg-gray-100 text-gray-600',
};

export default function EstadosEvaluacionPanel() {
  const { data: estados = [], isLoading, isError } = useEstadosEvaluacion();

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-live="polite">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
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
          className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3"
        >
          <span
            className={`mt-0.5 inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_COLORS[estado.nombre] ?? 'bg-muted text-on-surface-secondary'}`}
          >
            {estado.nombre}
          </span>
          <p className="text-xs text-on-surface-secondary">{estado.descripcion}</p>
        </div>
      ))}
    </div>
  );
}
