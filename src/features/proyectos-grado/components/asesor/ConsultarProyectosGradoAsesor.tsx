import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useProyectosGradoAsesor } from '../../hooks/useProyectosGradoAsesor';
import { OPCIONES_ESTADO_PROYECTO } from '../../utils/estados-proyecto';
import ProyectosGradoAsesorTable from './ProyectosGradoAsesorTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'proyecto' : 'proyectos'}`;
}

export default function ConsultarProyectosGradoAsesor() {
  const listado = useProyectosGradoAsesor();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const proyectos = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '' || listado.estadoIds.length > 0;
  const recargandoSinFilas = isPlaceholderData && proyectos.length === 0 && !hayFiltros;

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar proyectos',
          placeholder: 'Buscar por título del proyecto',
        }}
        chips={{
          etiqueta: 'Estado',
          opciones: OPCIONES_ESTADO_PROYECTO,
          seleccionados: listado.estadoIds,
          onAlternar: listado.toggleEstado,
          onTodos: listado.limpiarEstados,
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
            titulo="No se pudieron cargar los proyectos de grado"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <ProyectosGradoAsesorTable
            proyectos={proyectos}
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
          cantidadEnPagina={proyectos.length}
          etiquetaPlural="proyectos"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
