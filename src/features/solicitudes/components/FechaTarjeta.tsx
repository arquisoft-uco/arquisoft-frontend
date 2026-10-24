import FechaSolicitud from './FechaSolicitud';

interface Props {
  iso: string;
}

export default function FechaTarjeta({ iso }: Props) {
  return (
    <p className="text-[13px] text-on-surface-secondary">
      <FechaSolicitud iso={iso} />
    </p>
  );
}
