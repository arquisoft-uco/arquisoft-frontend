const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

interface Props {
  iso: string;
}

export default function FechaSolicitud({ iso }: Props) {
  const fecha = new Date(iso);
  if (!iso || Number.isNaN(fecha.getTime())) return <span>—</span>;
  return <time dateTime={iso}>{FORMATO_FECHA.format(fecha)}</time>;
}
