import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';
import { useEstadosFichasAsesor } from '../../hooks/useEstadosFichasAsesor';
import EstadosFichasAsesorFiltros from './EstadosFichasAsesorFiltros';
import EstadosFichasAsesorListado from './EstadosFichasAsesorListado';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'registro' : 'registros'}`;
}

export default function EstadosFichasAsesorPanel() {
  const listado = useEstadosFichasAsesor();
  const estados = useEstadosFicha();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const filas = data?.content ?? [];
  const hayFiltros = listado.estadoId !== '' || listado.texto.trim() !== '';
  const recargandoSinFilas = isPlaceholderData && filas.length === 0 && !hayFiltros;

  return (
    <div className={RAIZ}>
      <EstadosFichasAsesorFiltros listado={listado} estados={estados} />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar los estados de tus fichas"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <EstadosFichasAsesorListado
            filas={filas}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: 'tituloProyecto', direccion: listado.ordenDireccion }}
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
          cantidadEnPagina={filas.length}
          etiquetaPlural="registros"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
