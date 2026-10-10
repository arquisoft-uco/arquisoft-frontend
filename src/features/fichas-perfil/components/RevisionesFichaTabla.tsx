import type { ReactNode } from 'react';
import { ClipboardList } from 'lucide-react';
import type { DireccionOrden } from '../hooks/useRevisionesPaginadas';
import type { RevisionItemFila } from '../models/RevisionItem';
import PaginadorListado from '../../../shared/components/PaginadorListado';
import Badge from '../../../shared/components/ui/Badge';
import DataTable, { type ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { varianteEstadoRevision } from '../../../shared/utils/estado-variante';
import { FechaDeEstado } from './FichaCeldas';

const RAIZ = 'flex flex-col gap-3';
const IDENTIDAD = 'flex min-w-0 flex-col';
const TITULO = 'font-semibold text-on-surface';
const SUBTEXTO = 'line-clamp-2 text-[13px] text-on-surface-secondary';
const TARJETA = 'flex flex-col gap-2';
const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';
const CLAVE_ESTADO = 'estadoRevision';

function ItemRevisado({ fila }: { fila: RevisionItemFila }) {
  return (
    <div className={IDENTIDAD}>
      <span className={TITULO}>{fila.item?.tipoItem.nombre ?? 'Ítem no disponible'}</span>
      {fila.item && <span className={SUBTEXTO}>{fila.item.contenido}</span>}
    </div>
  );
}

function EstadoRevision({ fila }: { fila: RevisionItemFila }) {
  const { estadoId, estadoNombre } = fila.revision;
  return <Badge variante={varianteEstadoRevision(estadoId)}>{estadoNombre}</Badge>;
}

const COLUMNAS: ColumnaTabla<RevisionItemFila>[] = [
  { id: 'item', encabezado: 'Ítem', celda: (fila) => <ItemRevisado fila={fila} /> },
  {
    id: 'estado',
    encabezado: 'Estado',
    clave: CLAVE_ESTADO,
    ordenable: true,
    celda: (fila) => <EstadoRevision fila={fila} />,
  },
  {
    id: 'fecha',
    encabezado: 'Fecha de creación',
    celda: (fila) => <FechaDeEstado iso={fila.revision.fechaCreacion} />,
  },
];

interface Props {
  filas: RevisionItemFila[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  goToPage: (page: number) => void;
  direccion: DireccionOrden | undefined;
  ordenar: (direccion: DireccionOrden) => void;
  sinItems: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  reintentar: () => void;
  tituloVacio: string;
  descripcionVacia: string;
  acciones?: (fila: RevisionItemFila) => ReactNode;
}

export default function RevisionesFichaTabla({
  filas,
  totalElements,
  totalPages,
  page,
  pageSize,
  goToPage,
  direccion,
  ordenar,
  sinItems,
  isLoading,
  isError,
  error,
  reintentar,
  tituloVacio,
  descripcionVacia,
  acciones,
}: Props) {
  if (isError) {
    return (
      <ErrorState
        titulo="No pudimos cargar las revisiones"
        descripcion="Inténtalo nuevamente."
        detalle={getApiErrorMessage(error, 'No se pudieron cargar las revisiones.')}
        onReintentar={reintentar}
      />
    );
  }

  if (isLoading) return <Skeleton variante="tabla" etiqueta="Cargando revisiones…" />;

  if (sinItems || filas.length === 0) {
    return <EmptyState icono={ClipboardList} titulo={tituloVacio} descripcion={descripcionVacia} />;
  }

  return (
    <div className={RAIZ}>
      <DataTable
        etiqueta="Revisiones de ítems"
        columnas={COLUMNAS}
        filas={filas}
        idDeFila={(fila) => fila.revision.id}
        acciones={acciones}
        orden={direccion ? { clave: CLAVE_ESTADO, direccion } : undefined}
        onOrdenar={(clave, nuevaDireccion) => {
          if (clave === CLAVE_ESTADO) ordenar(nuevaDireccion);
        }}
        tarjeta={(fila) => (
          <div className={TARJETA}>
            <ItemRevisado fila={fila} />
            <div>
              <EstadoRevision fila={fila} />
            </div>
            <p className={DATO_TARJETA}>
              Creada el <FechaDeEstado iso={fila.revision.fechaCreacion} />
            </p>
          </div>
        )}
      />
      <PaginadorListado
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        cantidadEnPagina={filas.length}
        etiquetaPlural="revisiones"
        onPageChange={goToPage}
      />
    </div>
  );
}
