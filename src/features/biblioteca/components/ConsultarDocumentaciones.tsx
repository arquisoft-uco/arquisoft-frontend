import PaginadorListado from '../../../shared/components/PaginadorListado';
import ErrorState from '../../../shared/components/ui/ErrorState';
import FilterBar from '../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useDocumentaciones } from '../hooks/useDocumentaciones';
import { useEstadosDocumentacion } from '../hooks/useEstadosDocumentacion';
import DocumentacionesTable from './DocumentacionesTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'documentación' : 'documentaciones'}`;
}

interface Props {
  puedeFiltrarPorEstado: boolean;
}

export default function ConsultarDocumentaciones({ puedeFiltrarPorEstado }: Props) {
  const listado = useDocumentaciones(puedeFiltrarPorEstado);
  const { data: estados } = useEstadosDocumentacion(puedeFiltrarPorEstado);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const documentaciones = data?.content ?? [];
  const hayFiltros = listado.estadoIds.length > 0;
  const recargandoSinFilas = isPlaceholderData && documentaciones.length === 0 && !hayFiltros;
  const opciones = estados?.map((estado) => ({ id: estado.id, etiqueta: estado.nombre }));

  return (
    <div className={RAIZ}>
      {puedeFiltrarPorEstado && opciones && (
        <FilterBar
          chips={{
            etiqueta: 'Estado',
            opciones,
            seleccionados: listado.estadoIds,
            onAlternar: listado.toggleEstado,
            onTodos: listado.limpiarEstados,
          }}
          aplicados={[]}
          onLimpiar={listado.limpiarFiltros}
        />
      )}

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las documentaciones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <DocumentacionesTable
            documentaciones={documentaciones}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: 'fechaPublicacion', direccion: listado.ordenDireccion }}
            onOrdenar={(_campo, direccion) => listado.setOrden(direccion)}
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
          cantidadEnPagina={documentaciones.length}
          etiquetaPlural="documentaciones"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
