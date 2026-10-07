import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';

type TonoIconButton = 'neutro' | 'peligro';

const BASE =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9';

const TONOS: Record<TonoIconButton, string> = {
  neutro: 'text-on-surface-secondary hover:bg-muted hover:text-on-surface',
  peligro: 'text-on-surface-secondary hover:bg-danger-muted hover:text-danger-muted-foreground',
};

interface Props extends Omit<ComponentProps<'button'>, 'children'> {
  etiqueta: string;
  icono: LucideIcon;
  tono?: TonoIconButton;
}

export default function IconButton({
  etiqueta,
  icono: Icono,
  tono = 'neutro',
  type = 'button',
  className,
  ...resto
}: Props) {
  const clases = [BASE, TONOS[tono], className].filter(Boolean).join(' ');

  return (
    <button {...resto} type={type} aria-label={etiqueta} className={clases}>
      <Icono size={16} aria-hidden />
    </button>
  );
}
