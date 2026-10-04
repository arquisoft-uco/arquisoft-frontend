import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TriangleAlert } from 'lucide-react';
import { useTrampaDeFoco } from '../hooks/useTrampaDeFoco';
import Button from './ui/Button';

type Variante = 'peligro' | 'advertencia';

const RAIZ = 'fixed inset-0 z-50 flex items-center justify-center p-4';
const FONDO = 'absolute inset-0 bg-black/40';
const PANEL =
  'relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg animate-fade-up';
const CABECERA = 'flex items-start gap-3';
const ICONO = 'flex size-9 shrink-0 items-center justify-center rounded-lg';
const ICONO_POR_VARIANTE: Record<Variante, string> = {
  peligro: 'bg-danger-muted text-danger-muted-foreground',
  advertencia: 'bg-tertiary-muted text-tertiary-muted-foreground',
};
const TITULO = 'text-base font-semibold text-on-surface';
const DETALLE = 'mt-3.5 flex flex-col gap-3.5';
const DESCRIPCION = 'text-sm text-on-surface-secondary';
const CONSECUENCIAS = 'list-disc space-y-1 pl-5 text-sm text-on-surface-secondary';
const ACCIONES = 'mt-5 flex flex-wrap justify-end gap-2';

interface Props {
  titulo: string;
  descripcion?: string;
  consecuencias?: string[];
  labelConfirmar?: string;
  labelCancelar?: string;
  variante?: Variante;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmDialog({
  titulo,
  descripcion,
  consecuencias = [],
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Cancelar',
  variante = 'peligro',
  cargando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const idTitulo = useId();
  const idDetalle = useId();
  const panel = useRef<HTMLDivElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const tieneDetalle = Boolean(descripcion) || consecuencias.length > 0;

  function cancelarSiNoProcesa() {
    if (!cargando) onCancelar();
  }

  useTrampaDeFoco({ contenedor: panel, focoInicial: cancelar, alEscape: cancelarSiNoProcesa });

  return createPortal(
    <div className={RAIZ}>
      <div className={FONDO} onClick={cancelarSiNoProcesa} aria-hidden="true" />
      <div
        ref={panel}
        role={variante === 'peligro' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={tieneDetalle ? idDetalle : undefined}
        tabIndex={-1}
        className={PANEL}
      >
        <div className={CABECERA}>
          <span className={[ICONO, ICONO_POR_VARIANTE[variante]].join(' ')}>
            <TriangleAlert size={16} aria-hidden />
          </span>
          <h2 id={idTitulo} className={TITULO}>
            {titulo}
          </h2>
        </div>

        {tieneDetalle && (
          <div id={idDetalle} className={DETALLE}>
            {descripcion && <p className={DESCRIPCION}>{descripcion}</p>}
            {consecuencias.length > 0 && (
              <ul className={CONSECUENCIAS}>
                {consecuencias.map((consecuencia) => (
                  <li key={consecuencia}>{consecuencia}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={ACCIONES}>
          <Button ref={cancelar} variante="secundario" onClick={onCancelar} disabled={cargando}>
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
