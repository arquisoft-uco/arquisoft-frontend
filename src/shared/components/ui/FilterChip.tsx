import type { ComponentProps } from 'react';
import { Check } from 'lucide-react';

export interface OpcionFiltro {
  id: string;
  etiqueta: string;
}

const BASE =
  'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-9';
const INACTIVO = 'border-border-strong bg-surface text-on-surface enabled:hover:bg-muted';
const ACTIVO =
  'border-primary bg-primary-muted text-primary-muted-foreground hover:bg-primary-muted';

interface Props extends Omit<ComponentProps<'button'>, 'children' | 'className' | 'aria-pressed'> {
  etiqueta: string;
  activo: boolean;
}

export default function FilterChip({ etiqueta, activo, type = 'button', ...resto }: Props) {
  const clases = [BASE, activo ? ACTIVO : INACTIVO].join(' ');

  return (
    <button {...resto} type={type} aria-pressed={activo} className={clases}>
      {activo && <Check size={14} aria-hidden />}
      {etiqueta}
    </button>
  );
}
