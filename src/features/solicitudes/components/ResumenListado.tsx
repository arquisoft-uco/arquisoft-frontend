interface Props {
  total?: number;
  singular: string;
  plural: string;
}

export default function ResumenListado({ total, singular, plural }: Props) {
  const texto = total === undefined ? '' : `${total} ${total === 1 ? singular : plural}`;

  return (
    <p aria-live="polite" className="min-h-5 text-[13px] text-on-surface-secondary">
      {texto}
    </p>
  );
}
