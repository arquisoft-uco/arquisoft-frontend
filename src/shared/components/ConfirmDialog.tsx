import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

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
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-titulo"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancelar} aria-hidden="true" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg animate-fade-up">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className={
              variante === 'peligro'
                ? 'shrink-0 text-danger'
                : 'shrink-0 text-tertiary-muted-foreground'
            }
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <h2 id="confirm-dialog-titulo" className="text-sm font-semibold text-on-surface">
              {titulo}
            </h2>
            {descripcion && <p className="text-sm text-on-surface-secondary">{descripcion}</p>}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variante="secundario" onClick={onCancelar} disabled={cargando}>
            {labelCancelar}
          </Button>
          <Button
            variante={variante === 'peligro' ? 'peligro' : 'primario'}
            onClick={onConfirmar}
            cargando={cargando}
          >
            {cargando ? 'Procesando...' : labelConfirmar}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
