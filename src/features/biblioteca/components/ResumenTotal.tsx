const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

interface Props {
  total?: number;
  singular: string;
  plural: string;
}

export default function ResumenTotal({ total, singular, plural }: Props) {
  return (
    <p aria-live="polite" className={RESUMEN}>
      {total === undefined ? '' : `${total} ${total === 1 ? singular : plural}`}
    </p>
  );
}
