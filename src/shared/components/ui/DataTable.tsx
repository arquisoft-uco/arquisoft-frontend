import type { ReactNode } from 'react';
import DataTableCabecera from './DataTableCabecera';
import DataTableTarjetas from './DataTableTarjetas';
import Skeleton from './Skeleton';
import type { ColumnaTabla, DireccionOrden, OrdenTabla } from './DataTableCabecera';

export type { ColumnaTabla, DireccionOrden, OrdenTabla } from './DataTableCabecera';

const CONTENEDOR =
  'sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-surface sm:shadow-card';
const SCROLL = 'relative hidden overflow-x-auto sm:block';
const TABLA = 'w-full text-left text-sm';
const FILA = 'border-t border-border transition-colors hover:bg-surface-secondary';
const CELDA = 'px-4 py-3 align-middle';
const CELDA_ACCIONES = 'text-right';

interface Props<T> {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  idDeFila: (fila: T) => string;
  etiqueta: string;
  orden?: OrdenTabla;
  onOrdenar?: (clave: string, direccion: DireccionOrden) => void;
  acciones?: (fila: T) => ReactNode;
  tarjeta: (fila: T) => ReactNode;
  cargando?: boolean;
  vacio?: ReactNode;
}

export default function DataTable<T>({
  columnas,
  filas,
  idDeFila,
  etiqueta,
  orden,
  onOrdenar,
  acciones,
  tarjeta,
  cargando = false,
  vacio,
}: Props<T>) {
  if (cargando) {
    return <Skeleton variante="tabla" etiqueta={`Cargando ${etiqueta.toLowerCase()}…`} />;
  }
  if (filas.length === 0 && vacio) return <>{vacio}</>;

  return (
    <div className={CONTENEDOR}>
      <div className={SCROLL}>
        <table aria-label={etiqueta} className={TABLA}>
          <DataTableCabecera
            columnas={columnas}
            orden={orden}
            onOrdenar={onOrdenar}
            conAcciones={acciones !== undefined}
          />
          <tbody>
            {filas.map((fila) => (
              <tr key={idDeFila(fila)} className={FILA}>
                {columnas.map((columna) => (
                  <td key={columna.id} className={CELDA}>
                    {columna.celda(fila)}
                  </td>
                ))}
                {acciones && (
                  <td className={[CELDA, CELDA_ACCIONES].join(' ')}>{acciones(fila)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DataTableTarjetas
        filas={filas}
        idDeFila={idDeFila}
        etiqueta={etiqueta}
        tarjeta={tarjeta}
        acciones={acciones}
      />
    </div>
  );
}
