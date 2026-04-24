import { MessageSquare } from 'lucide-react';
import { useEvaluacionesMiFicha } from '../../hooks/useEvaluacionesMiFicha';

export default function EvaluacionesMiFichaPanel() {
  const { evaluaciones, observacionesEvaluacion, isLoading } = useEvaluacionesMiFicha();

  if (isLoading) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-on-surface">Evaluaciones</h3>

      {evaluaciones.map((ev) => {
        const obsEv = observacionesEvaluacion.filter(
          (o) => o.evaluacionFichaPerfilId === ev.id,
        );

        return (
          <div key={ev.id} className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface">Evaluación</span>
              <span className="text-xs text-on-surface-secondary">
                {new Date(ev.fechaCreacion).toLocaleDateString('es-CO')}
              </span>
            </div>

            {obsEv.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-border pt-2">
                {obsEv.map((obs) => (
                  <div key={obs.id} className="flex items-start gap-2">
                    <MessageSquare size={12} className="mt-0.5 text-on-surface-secondary" aria-hidden />
                    <p className="text-xs text-on-surface-secondary">{obs.observacion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {evaluaciones.length === 0 && (
        <p className="py-8 text-center text-sm text-on-surface-secondary">No hay evaluaciones aún</p>
      )}
    </div>
  );
}
