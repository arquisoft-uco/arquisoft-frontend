import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import Notice from '../../../../shared/components/ui/Notice';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosTarea } from '../../hooks/useEstadosTarea';
import { useTareasMapaRuta } from '../../hooks/useTareasMapaRuta';
import TareasMapaRutaTable from './TareasMapaRutaTable';

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

export default function ConsultarTareasMapaRuta({ mapaRutaId }: Props) {
  const listado = useTareasMapaRuta(mapaRutaId);
  const catalogo = useEstadosTarea();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, hayFiltros } =
    listado;
  const tareas = data?.content ?? [];
  const recargandoSinFilas = isPlaceholderData && tareas.length === 0 && !hayFiltros;
  const opcionesEstado = catalogo.data?.map(({ id, nombre }) => ({ id, etiqueta: nombre }));

  return (
    <section aria-labelledby="titulo-tareas-mapa-ruta" className={RAIZ}>
      <h2 id="titulo-tareas-mapa-ruta" className={TITULO}>
        Tareas
      </h2>

      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar tareas',
          placeholder: 'Buscar por descripción',
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
            titulo="No se pudieron cargar las tareas"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <TareasMapaRutaTable
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
