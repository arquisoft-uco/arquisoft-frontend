import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

const RAIZ =
  'flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-8 text-center';
const ICONO = 'flex size-12 items-center justify-center rounded-2xl bg-primary-muted text-primary';
const TITULO = 'text-base font-semibold text-on-surface';
const TEXTO = 'max-w-sm text-sm text-on-surface-secondary';

interface Props {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  className,
}: Props) {
  return (
    <div className={[RAIZ, className].filter(Boolean).join(' ')}>
      <div className={ICONO}>
        <Icono size={22} aria-hidden />
      </div>
      <p className={TITULO}>{titulo}</p>
      {descripcion && <p className={TEXTO}>{descripcion}</p>}
      {accion}
    </div>
  );
}
