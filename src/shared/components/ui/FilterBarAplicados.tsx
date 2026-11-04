import { X } from 'lucide-react';

const RAIZ = 'flex flex-wrap items-center gap-2 border-t border-border pt-3';
const ETIQUETA = 'text-sm text-on-surface-secondary';
const APLICADO =
  'inline-flex h-11 items-center gap-1 rounded-full bg-primary-muted pl-3 pr-1 text-sm font-medium text-primary-muted-foreground sm:h-8';
const QUITAR =
  'inline-flex size-11 items-center justify-center rounded-full hover:bg-primary/10 sm:size-6';
const LIMPIAR_TODO =
  'inline-flex items-center text-sm font-semibold text-primary underline underline-offset-4 max-sm:min-h-11';

interface Props {
  aplicados: { id: string; etiqueta: string; onQuitar: () => void }[];
  mostrarLimpiarTodo: boolean;
  onLimpiarTodo: () => void;
}

export default function FilterBarAplicados({
  aplicados,
  mostrarLimpiarTodo,
  onLimpiarTodo,
}: Props) {
  return (
    <div className={RAIZ}>
      {aplicados.length > 0 && <span className={ETIQUETA}>Filtros aplicados:</span>}
      {aplicados.map((aplicado) => (
        <span key={aplicado.id} className={APLICADO}>
          {aplicado.etiqueta}
          <button
            type="button"
            aria-label={`Quitar filtro ${aplicado.etiqueta}`}
            onClick={() => aplicado.onQuitar()}
            className={QUITAR}
          >
            <X size={14} aria-hidden />
          </button>
        </span>
      ))}
      {mostrarLimpiarTodo && (
        <button type="button" onClick={onLimpiarTodo} className={LIMPIAR_TODO}>
          Limpiar todo
        </button>
      )}
    </div>
  );
}
