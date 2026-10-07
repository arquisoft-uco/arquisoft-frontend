import type { ReactNode } from 'react';

export type VarianteBadge = 'neutro' | 'info' | 'exito' | 'advertencia' | 'peligro';

const BASE =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap';
const PUNTO = 'size-1.5 rounded-full bg-current';

const VARIANTES: Record<VarianteBadge, string> = {
  neutro: 'bg-muted text-muted-foreground',
  info: 'bg-primary-muted text-primary-muted-foreground',
  exito: 'bg-secondary-muted text-secondary-muted-foreground',
  advertencia: 'bg-tertiary-muted text-tertiary-muted-foreground',
  peligro: 'bg-danger-muted text-danger-muted-foreground',
};

interface Props {
  variante: VarianteBadge;
  children: ReactNode;
  className?: string;
}

export default function Badge({ variante, children, className }: Props) {
  const clases = [BASE, VARIANTES[variante], className].filter(Boolean).join(' ');

  return (
    <span className={clases}>
      <span className={PUNTO} aria-hidden="true" />
      {children}
    </span>
  );
}
