import Avatar from '../../../../shared/components/ui/Avatar';
import Badge from '../../../../shared/components/ui/Badge';
import { varianteEstadoAsesorProyecto } from '../../../../shared/utils/estado-variante';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';
import { formatearFecha } from '../../utils/formato-fecha';

const IDENTIDAD = 'flex min-w-0 items-center gap-3';
const TEXTOS = 'flex min-w-0 flex-col';
const NOMBRE = 'block truncate font-semibold text-on-surface';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';
const INSIGNIAS = 'flex flex-wrap items-center gap-1.5';

interface PropsAsesor {
  asesor: AsesorProyectoGrado;
}

export function AsesorProyectoIdentidad({ asesor }: PropsAsesor) {
  return (
    <div className={IDENTIDAD}>
      <Avatar nombre={asesor.nombre} />
      <div className={TEXTOS}>
        <span title={asesor.nombre} className={NOMBRE}>
          {asesor.nombre}
        </span>
        <span title={asesor.email} className={SUBTEXTO}>
          {asesor.email}
        </span>
        {!asesor.vigente && (
          <span>
            <Badge variante="peligro">Dado de baja</Badge>
          </span>
        )}
      </div>
    </div>
  );
}

interface PropsEstado extends PropsAsesor {
  ultimoRegistro?: boolean;
}

export function EstadoAsesorProyecto({ asesor, ultimoRegistro }: PropsEstado) {
  return (
    <div className={INSIGNIAS}>
      <Badge variante={varianteEstadoAsesorProyecto(asesor.estado.id)}>
        {asesor.estado.nombre}
      </Badge>
      {asesor.actual && <Badge variante="info">Actual</Badge>}
      {ultimoRegistro && <Badge variante="neutro">Último registro</Badge>}
    </div>
  );
}

interface PropsFecha {
  iso: string;
}

export function FechaAsignacion({ iso }: PropsFecha) {
  return <span>{formatearFecha(iso)}</span>;
}
