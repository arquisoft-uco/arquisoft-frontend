import { Hammer } from 'lucide-react';

export default function EvaluacionesMiFichaPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface py-12 text-center">
      <Hammer size={24} className="text-on-surface-secondary" aria-hidden />
      <p className="text-sm font-medium text-on-surface">Evaluaciones</p>
      <p className="max-w-xs text-xs text-on-surface-secondary">
        Esta funcionalidad está en proceso de construcción y estará disponible próximamente.
      </p>
    </div>
  );
}
