import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';

type TonoIconButton = 'neutro' | 'primario' | 'peligro';

const BASE =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9';

const TONOS: Record<TonoIconButton, string> = {
  neutro: 'text-on-surface-secondary hover:bg-muted hover:text-on-surface',
  primario:
    'text-on-surface-secondary hover:bg-primary-muted hover:text-primary-muted-foreground focus-visible:bg-primary-muted focus-visible:text-primary-muted-foreground',
  peligro: 'text-on-surface-secondary hover:bg-danger-muted hover:text-danger-muted-foreground',
};

const CON_ROTULO = 'group relative';
const ROTULO =
  'pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-border bg-surface-elevated px-2 py-1 text-xs font-medium text-on-surface opacity-0 shadow-dropdown transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100';

type PosicionRotulo = 'izquierda' | 'arriba';

const POSICIONES_ROTULO: Record<PosicionRotulo, string> = {
  izquierda: 'right-full top-1/2 mr-2 -translate-y-1/2',
  arriba: 'bottom-full right-0 mb-1',
};

interface Props extends Omit<ComponentProps<'button'>, 'children'> {
  etiqueta: string;
  icono: LucideIcon;
  tono?: TonoIconButton;
  rotulo?: string;
  rotuloPosicion?: PosicionRotulo;
}

export default function IconButton({
  etiqueta,
  icono: Icono,
  tono = 'neutro',
  rotulo,
  rotuloPosicion = 'izquierda',
  type = 'button',
  className,
  ...resto
}: Props) {
  const clases = [BASE, TONOS[tono], rotulo && CON_ROTULO, className].filter(Boolean).join(' ');

  return (
    <button {...resto} type={type} aria-label={etiqueta} className={clases}>
      <Icono size={16} aria-hidden />
      {rotulo && (
        <span aria-hidden className={`${ROTULO} ${POSICIONES_ROTULO[rotuloPosicion]}`}>
          {rotulo}
        </span>
      )}
    </button>
  );
}
