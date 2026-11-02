import type { ReactNode } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import { varianteEstadoObservacionArtefacto } from '../../../shared/utils/estado-variante';
import type { ObservacionRevision } from '../models/ObservacionRevision';

const LISTA = 'flex flex-col gap-3';
const TARJETA =
  'flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-secondary p-4 text-sm text-on-surface';
const CONTENIDO = 'flex min-w-0 flex-col items-start gap-3';
const DESCRIPCION = 'min-w-0 break-words';

interface Props {
  observaciones: ObservacionRevision[];
  acciones?: (observacion: ObservacionRevision) => ReactNode;
  etiqueta?: string;
}

export default function ListaObservacionesRevision({
  observaciones,
  acciones,
  etiqueta = 'Observaciones de la revisión',
}: Props) {
  return (
    <ul aria-label={etiqueta} className={LISTA}>
      {observaciones.map((observacion) => (
        <li key={observacion.id} className={TARJETA}>
          <div className={CONTENIDO}>
            <span className={DESCRIPCION}>{observacion.descripcion}</span>
            <Badge variante={varianteEstadoObservacionArtefacto(observacion.estadoId)}>
              {observacion.estadoNombre}
            </Badge>
          </div>
          {acciones?.(observacion)}
        </li>
      ))}
    </ul>
  );
}
