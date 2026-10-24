import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';

type VarianteButton = 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'peligroContorno';
type TamanoButton = 'md' | 'sm';

const BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed';
const ATENUADO_DESHABILITADO = 'disabled:opacity-50';
const SPINNER = 'size-4 animate-spin rounded-full border-2 border-current border-t-transparent';

const TAMANOS: Record<TamanoButton, string> = {
  md: 'h-11 px-4 text-sm sm:h-10',
  sm: 'h-11 px-3 text-sm sm:h-8',
};

const VARIANTES: Record<VarianteButton, string> = {
  primario: 'border-transparent bg-primary text-primary-foreground hover:bg-primary-hover',
  secundario: 'border-border-strong bg-surface text-on-surface hover:bg-muted',
  fantasma: 'border-transparent text-primary hover:bg-primary-muted',
  peligro: 'border-transparent bg-danger text-danger-foreground hover:bg-danger/90',
  peligroContorno: 'border-danger bg-surface text-danger-muted-foreground hover:bg-danger-muted',
};

interface Props extends ComponentProps<'button'> {
  variante?: VarianteButton;
  tamano?: TamanoButton;
  cargando?: boolean;
  icono?: LucideIcon;
}

export default function Button({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  icono: Icono,
  type = 'button',
  disabled,
  className,
  children,
  ...resto
}: Props) {
  const clases = [
    BASE,
    TAMANOS[tamano],
    VARIANTES[variante],
    cargando ? '' : ATENUADO_DESHABILITADO,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...resto}
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={clases}
    >
      {cargando ? (
        <span className={SPINNER} aria-hidden="true" />
      ) : (
        Icono && <Icono size={16} aria-hidden />
      )}
      {children}
    </button>
  );
}
