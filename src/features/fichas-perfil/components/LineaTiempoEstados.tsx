import Badge from '../../../shared/components/ui/Badge';
import { varianteEstadoFicha } from '../../../shared/utils/estado-variante';
import type { HistorialEstadoFichaPerfil } from '../models/HistorialEstadoFichaPerfil';
import { FechaDeEstado } from './FichaCeldas';

const LISTA = 'flex flex-col';
const PASO = 'flex gap-3';
const RIEL = 'flex flex-col items-center';
const PUNTO = 'mt-1.5 size-3 shrink-0 rounded-full';
const PUNTO_ACTUAL = 'bg-primary';
const PUNTO_ANTERIOR = 'bg-border-strong';
const LINEA = 'w-px flex-1 bg-border';
const CONTENIDO = 'flex min-w-0 flex-col gap-1 pb-5';
const FILA_ESTADO = 'flex flex-wrap items-center gap-2';
const FECHA = 'text-sm text-on-surface-secondary';

interface Props {
  historial: HistorialEstadoFichaPerfil[];
}

export default function LineaTiempoEstados({ historial }: Props) {
  return (
    <ol aria-label="Historial de estados de la ficha" className={LISTA}>
      {historial.map((estado, indice) => {
        const esActual = indice === 0;
        const esUltimo = indice === historial.length - 1;
        return (
          <li key={estado.id + estado.fechaActualizacion} className={PASO}>
            <div className={RIEL} aria-hidden="true">
              <span className={[PUNTO, esActual ? PUNTO_ACTUAL : PUNTO_ANTERIOR].join(' ')} />
              {!esUltimo && <span className={LINEA} />}
            </div>
            <div className={CONTENIDO}>
              <div className={FILA_ESTADO}>
                <Badge variante={varianteEstadoFicha(estado.id)}>{estado.nombre}</Badge>
                {esActual && <Badge variante="info">Actual</Badge>}
              </div>
              <span className={FECHA}>
                <FechaDeEstado iso={estado.fechaActualizacion} />
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
