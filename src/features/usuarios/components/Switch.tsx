import { useId, type ReactNode } from 'react';

const FILA = 'flex min-h-16 items-center gap-3 border-t border-border py-2.5 first:border-t-0';
const TEXTOS = 'flex min-w-0 flex-1 flex-col';
const ETIQUETA = 'text-sm font-semibold text-on-surface';
const DESCRIPCION = 'text-[13px] text-on-surface-secondary';
const PISTA =
  'relative inline-flex h-6.5 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';
const PISTA_APAGADA = 'bg-border-input';
const PISTA_ENCENDIDA = 'bg-primary';
const PULGAR = 'absolute left-0.75 size-5 rounded-full bg-surface shadow-sm transition-transform';
const PULGAR_ENCENDIDO = 'translate-x-4.5';

const clasesDeLaPista = (marcado: boolean) =>
  [PISTA, marcado ? PISTA_ENCENDIDA : PISTA_APAGADA].join(' ');

const clasesDelPulgar = (marcado: boolean) =>
  [PULGAR, marcado && PULGAR_ENCENDIDO].filter(Boolean).join(' ');

interface Props {
  marcado: boolean;
  onCambiar: (valor: boolean) => void;
  etiqueta: string;
  descripcion?: string;
  insignia?: ReactNode;
  pendiente?: boolean;
  deshabilitado?: boolean;
}

export default function Switch({
  marcado,
  onCambiar,
  etiqueta,
  descripcion,
  insignia,
  pendiente = false,
  deshabilitado = false,
}: Props) {
  const id = useId();
  const idDescripcion = `${id}-descripcion`;
  const idInsignia = `${id}-insignia`;
  const descritoPor = [descripcion && idDescripcion, insignia && idInsignia]
    .filter(Boolean)
    .join(' ');

  function alternar() {
    if (!pendiente) onCambiar(!marcado);
  }

  return (
    <div className={FILA}>
      <div className={TEXTOS}>
        <label htmlFor={id} className={ETIQUETA}>
          {etiqueta}
        </label>
        {descripcion && (
          <span id={idDescripcion} className={DESCRIPCION}>
            {descripcion}
          </span>
        )}
      </div>
      {insignia && <span id={idInsignia}>{insignia}</span>}
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={marcado}
        aria-describedby={descritoPor || undefined}
        aria-busy={pendiente || undefined}
        aria-disabled={pendiente || undefined}
        disabled={deshabilitado}
        onClick={alternar}
        className={clasesDeLaPista(marcado)}
      >
        <span aria-hidden="true" className={clasesDelPulgar(marcado)} />
      </button>
    </div>
  );
}
