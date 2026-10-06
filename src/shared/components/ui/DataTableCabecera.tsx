import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export type DireccionOrden = 'ASC' | 'DESC';

export interface OrdenTabla {
  clave: string;
  direccion: DireccionOrden;
}

export interface ColumnaTabla<T> {
  id: string;
  encabezado: string;
  celda: (fila: T) => ReactNode;
  ordenable?: boolean;
  clave?: string;
}

const CABECERA = 'bg-surface-secondary text-xs font-semibold text-on-surface-secondary';
const TH = 'px-4 py-3 font-semibold';
const ORDEN =
  '-ml-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 font-semibold hover:bg-muted hover:text-on-surface';
const ICONO_SIN_ORDEN = 'opacity-30';

function IconoOrden({ direccion }: { direccion?: DireccionOrden }) {
  if (direccion === 'ASC') return <ArrowUp size={14} aria-hidden />;
  if (direccion === 'DESC') return <ArrowDown size={14} aria-hidden />;
  return <ArrowUpDown size={14} aria-hidden className={ICONO_SIN_ORDEN} />;
}

function ariaSort(direccion?: DireccionOrden): 'ascending' | 'descending' | 'none' {
  if (direccion === 'ASC') return 'ascending';
  return direccion === 'DESC' ? 'descending' : 'none';
}

interface Props<T> {
  columnas: ColumnaTabla<T>[];
  orden?: OrdenTabla;
  onOrdenar?: (clave: string, direccion: DireccionOrden) => void;
  conAcciones: boolean;
}

export default function DataTableCabecera<T>({
  columnas,
  orden,
  onOrdenar,
  conAcciones,
}: Props<T>) {
  return (
    <thead className={CABECERA}>
      <tr>
        {columnas.map((columna) => {
          if (!columna.ordenable) {
            return (
              <th key={columna.id} scope="col" className={TH}>
                {columna.encabezado}
              </th>
            );
          }
          const clave = columna.clave ?? columna.id;
          const direccion = orden?.clave === clave ? orden.direccion : undefined;
          const siguiente: DireccionOrden = direccion === 'ASC' ? 'DESC' : 'ASC';
          return (
            <th key={columna.id} scope="col" aria-sort={ariaSort(direccion)} className={TH}>
              <button type="button" onClick={() => onOrdenar?.(clave, siguiente)} className={ORDEN}>
                {columna.encabezado}
                <IconoOrden direccion={direccion} />
              </button>
            </th>
          );
        })}
        {conAcciones && (
          <th scope="col" className={TH}>
            <span className="sr-only">Acciones</span>
          </th>
        )}
      </tr>
    </thead>
  );
}
