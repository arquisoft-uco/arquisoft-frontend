import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

interface Props {
  titulo: string;
  descripcion?: string;
  labelConfirmar?: string;
  labelCancelar?: string;
  variante?: 'peligro' | 'advertencia';
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmDialog({
  titulo,
  descripcion,
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Cancelar',
  variante = 'peligro',
  cargando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const colorConfirmar =
    variante === 'peligro'
      ? 'bg-danger text-danger-foreground hover:bg-danger/90'
      : 'bg-tertiary text-tertiary-foreground hover:bg-tertiary-hover';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-titulo"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancelar}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg animate-fade-up">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className={variante === 'peligro' ? 'shrink-0 text-danger' : 'shrink-0 text-warning'}
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <h2 id="confirm-dialog-titulo" className="text-sm font-semibold text-on-surface">
              {titulo}
            </h2>
            {descripcion && (
              <p className="text-sm text-on-surface-secondary">{descripcion}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted disabled:opacity-50"
          >
            {labelCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${colorConfirmar}`}
          >
            {cargando ? 'Procesando...' : labelConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
