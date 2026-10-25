import Badge from '../../../../shared/components/ui/Badge';
import { varianteEstadoObservacionArtefacto } from '../../../../shared/utils/estado-variante';
import type { ObservacionRevision } from '../../models/ObservacionRevision';

const LISTA = 'flex flex-col gap-3';
const TARJETA =
  'flex flex-col items-start gap-3 rounded-xl border border-border bg-surface-secondary p-4 text-sm text-on-surface';
const DESCRIPCION = 'min-w-0 break-words';

interface Props {
  observaciones: ObservacionRevision[];
}

export default function ListaObservacionesRevision({ observaciones }: Props) {
  return (
    <ul aria-label="Observaciones de la revisión" className={LISTA}>
      {observaciones.map((observacion) => (
        <li key={observacion.id} className={TARJETA}>
          <span className={DESCRIPCION}>{observacion.descripcion}</span>
          <Badge variante={varianteEstadoObservacionArtefacto(observacion.estadoId)}>
            {observacion.estadoNombre}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
