import { CircleAlert, RefreshCw } from 'lucide-react';
import Button from './Button';

const RAIZ =
  'flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface px-5 py-8 text-center';
const ICONO =
  'flex size-12 items-center justify-center rounded-2xl bg-danger-muted text-danger-muted-foreground';
const TITULO = 'text-base font-semibold text-on-surface';
const TEXTO = 'max-w-sm text-sm text-on-surface-secondary';
const DETALLE = 'text-xs text-on-surface-secondary';

interface Props {
  titulo: string;
  descripcion?: string;
  onReintentar?: () => void;
  detalle?: string;
  className?: string;
}

export default function ErrorState({
  titulo,
  descripcion,
  onReintentar,
  detalle,
  className,
}: Props) {
  return (
    <div role="alert" className={[RAIZ, className].filter(Boolean).join(' ')}>
      <div className={ICONO}>
        <CircleAlert size={22} aria-hidden />
      </div>
      <p className={TITULO}>{titulo}</p>
      {descripcion && <p className={TEXTO}>{descripcion}</p>}
      {onReintentar && (
        <Button variante="secundario" icono={RefreshCw} onClick={() => onReintentar()}>
          Reintentar
        </Button>
      )}
      {detalle && <p className={DETALLE}>{detalle}</p>}
    </div>
  );
}
