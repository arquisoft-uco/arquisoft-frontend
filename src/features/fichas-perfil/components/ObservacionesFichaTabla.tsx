import type { ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';
import type { DireccionOrden } from '../hooks/useRevisionesPaginadas';
import type { ObservacionItemFila } from '../models/ObservacionItem';
import PaginadorListado from '../../../shared/components/PaginadorListado';
import Badge from '../../../shared/components/ui/Badge';
import DataTable, { type ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { varianteEstadoObservacion } from '../../../shared/utils/estado-variante';
import ItemRevisado from './ItemRevisado';

const RAIZ = 'flex flex-col gap-3';
const TARJETA = 'flex flex-col gap-2';
const TEXTO_OBSERVACION = 'text-on-surface';
const CLAVE_ESTADO = 'estadoObservacionRevision';

function EstadoObservacion({ fila }: { fila: ObservacionItemFila }) {
  const { estadoId, estadoNombre } = fila.observacion;
  return <Badge variante={varianteEstadoObservacion(estadoId)}>{estadoNombre}</Badge>;
}

const COLUMNAS: ColumnaTabla<ObservacionItemFila>[] = [
  { id: 'item', encabezado: 'Ítem', celda: (fila) => <ItemRevisado item={fila.item} /> },
  {
    id: 'observacion',
    encabezado: 'Observación',
    celda: (fila) => <span className={TEXTO_OBSERVACION}>{fila.observacion.observacion}</span>,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    clave: CLAVE_ESTADO,
    ordenable: true,
    celda: (fila) => <EstadoObservacion fila={fila} />,
  },
];

interface Props {
  filas: ObservacionItemFila[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  goToPage: (page: number) => void;
  direccion: DireccionOrden | undefined;
  ordenar: (direccion: DireccionOrden) => void;
  sinObservables: boolean;
  tituloVacio: string;
  descripcionVacia: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  reintentar: () => void;
  acciones?: (fila: ObservacionItemFila) => ReactNode;
}

export default function ObservacionesFichaTabla({
  filas,
  totalElements,
  totalPages,
  page,
  pageSize,
  goToPage,
  direccion,
  ordenar,
  sinObservables,
  tituloVacio,
  descripcionVacia,
  isLoading,
  isError,
  error,
  reintentar,
  acciones,
}: Props) {
  if (isError) {
    return (
      <ErrorState
        titulo="No pudimos cargar las observaciones"
        descripcion="Inténtalo nuevamente."
        detalle={getApiErrorMessage(error, 'No se pudieron cargar las observaciones.')}
        onReintentar={reintentar}
      />
    );
  }

  if (isLoading) return <Skeleton variante="tabla" etiqueta="Cargando observaciones…" />;

  if (sinObservables || filas.length === 0) {
    return <EmptyState icono={MessageSquare} titulo={tituloVacio} descripcion={descripcionVacia} />;
  }

  return (
    <div className={RAIZ}>
      <DataTable
        etiqueta="Observaciones de ítems"
        columnas={COLUMNAS}
        filas={filas}
        idDeFila={(fila) => fila.observacion.id}
        acciones={acciones}
        orden={direccion ? { clave: CLAVE_ESTADO, direccion } : undefined}
        onOrdenar={(clave, nuevaDireccion) => {
          if (clave === CLAVE_ESTADO) ordenar(nuevaDireccion);
        }}
        tarjeta={(fila) => (
          <div className={TARJETA}>
            <ItemRevisado item={fila.item} />
            <p className={TEXTO_OBSERVACION}>{fila.observacion.observacion}</p>
            <div>
              <EstadoObservacion fila={fila} />
            </div>
          </div>
        )}
      />
      <PaginadorListado
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        cantidadEnPagina={filas.length}
        etiquetaPlural="observaciones"
        onPageChange={goToPage}
      />
    </div>
  );
}
