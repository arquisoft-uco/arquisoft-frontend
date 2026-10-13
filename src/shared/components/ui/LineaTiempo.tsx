import Badge from './Badge';
import type { VarianteBadge } from './Badge';

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

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export interface PasoLineaTiempo {
  id: string;
  nombre: string;
  variante: VarianteBadge;
  fecha: string;
}

interface Props {
  pasos: PasoLineaTiempo[];
  etiqueta: string;
}

function FechaDelPaso({ iso }: { iso: string }) {
  const fecha = new Date(iso);
  if (!iso || Number.isNaN(fecha.getTime())) return <span>—</span>;

  return <time dateTime={iso}>{formatoFecha.format(fecha)}</time>;
}

export default function LineaTiempo({ pasos, etiqueta }: Props) {
  return (
    <ol aria-label={etiqueta} className={LISTA}>
      {pasos.map((paso, indice) => {
        const esActual = indice === 0;
        const esUltimo = indice === pasos.length - 1;
        return (
          <li key={paso.id + paso.fecha} className={PASO}>
            <div className={RIEL} aria-hidden="true">
              <span className={[PUNTO, esActual ? PUNTO_ACTUAL : PUNTO_ANTERIOR].join(' ')} />
              {!esUltimo && <span className={LINEA} />}
            </div>
            <div className={CONTENIDO}>
              <div className={FILA_ESTADO}>
                <Badge variante={paso.variante}>{paso.nombre}</Badge>
                {esActual && <Badge variante="info">Actual</Badge>}
              </div>
              <span className={FECHA}>
                <FechaDelPaso iso={paso.fecha} />
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
