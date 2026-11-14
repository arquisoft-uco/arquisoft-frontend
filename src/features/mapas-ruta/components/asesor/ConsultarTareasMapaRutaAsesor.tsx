import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useTareasMapaRutaAsesor } from '../../hooks/useTareasMapaRutaAsesor';
import TareasMapaRutaTable from '../estudiante/TareasMapaRutaTable';

const RAIZ = 'flex flex-col gap-4';
const TITULO = 'text-lg font-semibold text-on-surface';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'tarea' : 'tareas'}`;
}

interface Props {
  mapaRutaId: string;
}

export default function ConsultarTareasMapaRutaAsesor({ mapaRutaId }: Props) {
  const listado = useTareasMapaRutaAsesor(mapaRutaId);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, hayFiltros } =
    listado;
  const tareas = data?.content ?? [];
  const recargandoSinFilas = isPlaceholderData && tareas.length === 0 && !hayFiltros;

  return (
    <section aria-labelledby="titulo-tareas-mapa-ruta-asesor" className={RAIZ}>
      <h2 id="titulo-tareas-mapa-ruta-asesor" className={TITULO}>
        Tareas
      </h2>

      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar tareas',
          placeholder: 'Buscar por descripción',
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
            titulo="No se pudieron cargar las tareas"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <TareasMapaRutaTable
            soloLectura
            tareas={tareas}
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
          cantidadEnPagina={tareas.length}
          etiquetaPlural="tareas"
          onPageChange={listado.goToPage}
        />
      )}
    </section>
  );
}
