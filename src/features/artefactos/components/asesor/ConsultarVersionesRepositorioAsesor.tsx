import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useVersionesRepositorioAsesor } from '../../hooks/useVersionesRepositorioAsesor';
import VersionesRepositorioAsesorTable from './VersionesRepositorioAsesorTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'versión' : 'versiones'}`;
}

export default function ConsultarVersionesRepositorioAsesor() {
  const listado = useVersionesRepositorioAsesor();
  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const versiones = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '';

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar versiones',
          placeholder: 'Buscar por documento, archivo o repositorio',
        }}
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
        totalResultados={data?.totalElements}
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las versiones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <VersionesRepositorioAsesorTable
            versiones={versiones}
            cargando={isLoading}
            hayFiltros={hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
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
          cantidadEnPagina={versiones.length}
          etiquetaPlural="versiones"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
