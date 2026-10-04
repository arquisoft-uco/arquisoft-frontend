const RAIZ =
  'flex flex-col items-center justify-center gap-2 py-12 text-sm text-on-surface-secondary';
const SPINNER = 'size-5 animate-spin rounded-full border-2 border-primary border-t-transparent';

interface Props {
  etiqueta: string;
  className?: string;
}

export default function LoadingState({ etiqueta, className }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={[RAIZ, className].filter(Boolean).join(' ')}
    >
      <span className={SPINNER} aria-hidden="true" />
      <span>{etiqueta}</span>
    </div>
  );
}
