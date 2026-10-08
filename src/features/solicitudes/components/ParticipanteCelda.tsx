import Avatar from '../../../shared/components/ui/Avatar';

const IDENTIDAD = 'flex min-w-0 items-center gap-3';
const TEXTOS = 'flex min-w-0 flex-col';
const NOMBRE = 'block truncate font-semibold text-on-surface';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';

interface Props {
  nombre: string;
  detalle: string;
}

export default function ParticipanteCelda({ nombre, detalle }: Props) {
  return (
    <div className={IDENTIDAD}>
      <Avatar nombre={nombre} />
      <div className={TEXTOS}>
        <span title={nombre} className={NOMBRE}>
          {nombre}
        </span>
        <span title={detalle} className={SUBTEXTO}>
          {detalle}
        </span>
      </div>
    </div>
  );
}
