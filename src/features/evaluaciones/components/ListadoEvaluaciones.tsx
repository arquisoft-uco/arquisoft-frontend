import type { ReactNode } from 'react';
import PaginadorListado from '../../../shared/components/PaginadorListado';
import ErrorState from '../../../shared/components/ui/ErrorState';
import FilterBar from '../../../shared/components/ui/FilterBar';
import Notice from '../../../shared/components/ui/Notice';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useCatalogoEstadosEvaluacion } from '../hooks/useCatalogoEstadosEvaluacion';
import type { ListadoEvaluaciones as ListadoEvaluacionesData } from '../hooks/useListadoEvaluaciones';
import type { Evaluacion } from '../models/Evaluacion';
import EvaluacionesTable from './EvaluacionesTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'evaluación' : 'evaluaciones'}`;
}

interface Props {
  listado: ListadoEvaluacionesData;
  acciones?: (evaluacion: Evaluacion) => ReactNode;
  encabezadoAcciones?: string;
  descripcionVacio?: string;
}

export default function ListadoEvaluaciones({
  listado,
  acciones,
  encabezadoAcciones,
  descripcionVacio,
}: Props) {
  const catalogo = useCatalogoEstadosEvaluacion();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const evaluaciones = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '' || listado.estadoIds.length > 0;
  const recargandoSinFilas = isPlaceholderData && evaluaciones.length === 0 && !hayFiltros;
  const opcionesEstado = catalogo.data?.map(({ id, nombre }) => ({ id, etiqueta: nombre }));

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar evaluaciones',
          placeholder: 'Buscar por nombre del proyecto',
        }}
        chips={
          opcionesEstado
            ? {
                etiqueta: 'Estado',
                opciones: opcionesEstado,
                seleccionados: listado.estadoIds,
                onAlternar: listado.toggleEstado,
                onTodos: listado.limpiarEstados,
              }
            : undefined
        }
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
      />

      {catalogo.isError && (
        <Notice
          variante="advertencia"
          accion={{ etiqueta: 'Reintentar', onClick: () => void catalogo.refetch() }}
        >
          No se pudieron cargar los estados para filtrar.
        </Notice>
      )}

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las evaluaciones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <EvaluacionesTable
            evaluaciones={evaluaciones}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            acciones={acciones}
            encabezadoAcciones={encabezadoAcciones}
            descripcionVacio={descripcionVacio}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={evaluaciones.length}
          etiquetaPlural="evaluaciones"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
