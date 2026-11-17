import PaginadorListado from '../../../shared/components/PaginadorListado';
import ErrorState from '../../../shared/components/ui/ErrorState';
import FilterBar from '../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { LIMITES } from '../../../shared/validation';
import { useEntregablesDisponibles } from '../hooks/useEntregablesDisponibles';
import EntregablesDisponiblesTable from './EntregablesDisponiblesTable';
import ResumenTotal from './ResumenTotal';

const RAIZ = 'flex flex-col gap-4';

export default function ConsultarEntregablesDisponibles() {
  const listado = useEntregablesDisponibles();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const entregables = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '';
  const recargandoSinFilas = isPlaceholderData && entregables.length === 0 && !hayFiltros;

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar entregables',
          placeholder: 'Buscar por título del proyecto',
          maxLength: LIMITES.TITULO_PROYECTO_MAX,
        }}
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
      />

      <ResumenTotal total={data?.totalElements} singular="entregable" plural="entregables" />

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar los entregables por registrar"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <EntregablesDisponiblesTable
            entregables={entregables}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            onLimpiarFiltros={listado.limpiarFiltros}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={entregables.length}
          etiquetaPlural="entregables"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
