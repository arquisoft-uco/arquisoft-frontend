import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { usePlanesRealesProyectoAsesor } from '../../hooks/usePlanesRealesProyectoAsesor';
import PlanesRealesProyectoTable from './PlanesRealesProyectoTable';

const RAIZ = 'flex flex-col gap-4';
const TITULO = 'text-lg font-semibold text-on-surface';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'plan real' : 'planes reales'}`;
}

interface Props {
  proyectoGradoId: string;
}

export default function ConsultarPlanesRealesProyectoAsesor({ proyectoGradoId }: Props) {
  const listado = usePlanesRealesProyectoAsesor(proyectoGradoId);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, hayFiltros } =
    listado;
  const planes = data?.content ?? [];
  const recargandoSinFilas = isPlaceholderData && planes.length === 0 && !hayFiltros;

  return (
    <section aria-labelledby="titulo-planes-reales-proyecto-asesor" className={RAIZ}>
      <h2 id="titulo-planes-reales-proyecto-asesor" className={TITULO}>
        Planes reales
      </h2>

      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar planes reales',
          placeholder: 'Buscar por tarea o descripción',
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
            titulo="No se pudieron cargar los planes reales"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <PlanesRealesProyectoTable
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
          etiquetaPlural="planes reales"
          onPageChange={listado.goToPage}
        />
      )}
    </section>
  );
}
