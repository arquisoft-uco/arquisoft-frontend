import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useFichasPerfilCoordinador } from '../../hooks/useFichasPerfilCoordinador';
import FichasPerfilTable from './FichasPerfilTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'ficha' : 'fichas'}`;
}

export default function ConsultarFichasPerfilCoordinador() {
  const listado = useFichasPerfilCoordinador();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const fichas = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '';
  const recargandoSinFilas = isPlaceholderData && fichas.length === 0 && !hayFiltros;

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar fichas',
          placeholder: 'Buscar por título del proyecto',
        }}
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las fichas de perfil"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <FichasPerfilTable
            fichas={fichas}
            cargando={isLoading || recargandoSinFilas}
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
          cantidadEnPagina={fichas.length}
          etiquetaPlural="fichas"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
