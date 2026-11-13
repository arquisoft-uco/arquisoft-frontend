import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { usePlanesEstimadosProyectoAsesor } from '../../hooks/usePlanesEstimadosProyectoAsesor';
import PlanesEstimadosProyectoTable from './PlanesEstimadosProyectoTable';

const RAIZ = 'flex flex-col gap-4';
const TITULO = 'text-lg font-semibold text-on-surface';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'plan estimado' : 'planes estimados'}`;
}

interface Props {
  proyectoGradoId: string;
}

export default function ConsultarPlanesEstimadosProyecto({ proyectoGradoId }: Props) {
  const listado = usePlanesEstimadosProyectoAsesor(proyectoGradoId);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, hayFiltros } =
    listado;
  const planes = data?.content ?? [];
  const recargandoSinFilas = isPlaceholderData && planes.length === 0 && !hayFiltros;

  return (
    <section aria-labelledby="titulo-planes-estimados-proyecto" className={RAIZ}>
      <h2 id="titulo-planes-estimados-proyecto" className={TITULO}>
        Planes estimados
      </h2>

      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar planes estimados',
          placeholder: 'Buscar por tarea o descripción del plan',
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
            titulo="No se pudieron cargar los planes estimados"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <PlanesEstimadosProyectoTable
            planes={planes}
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
          cantidadEnPagina={planes.length}
          etiquetaPlural="planes estimados"
          onPageChange={listado.goToPage}
        />
      )}
    </section>
  );
}
