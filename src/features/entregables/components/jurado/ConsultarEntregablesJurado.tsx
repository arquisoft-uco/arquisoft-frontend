import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEntregablesJurado } from '../../hooks/useEntregablesJurado';
import EntregablesJuradoTable from './EntregablesJuradoTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'entregable' : 'entregables'}`;
}

export default function ConsultarEntregablesJurado() {
  const listado = useEntregablesJurado();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const entregables = data?.content ?? [];
  const asesor = listado.asesor.trim();
  const hayFiltros = listado.texto.trim() !== '' || asesor !== '';
  const recargandoSinFilas = isPlaceholderData && entregables.length === 0 && !hayFiltros;

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar proyectos',
          placeholder: 'Buscar por nombre del proyecto',
        }}
        popover={{
          secciones: [
            {
              tipo: 'texto',
              id: 'asesor',
              etiqueta: 'Asesor',
              valor: listado.asesor,
              onCambiar: listado.setAsesor,
              placeholder: 'Nombre del asesor',
            },
          ],
        }}
        aplicados={
          asesor
            ? [
                {
                  id: 'asesor',
                  etiqueta: `Asesor: ${asesor}`,
                  onQuitar: () => listado.setAsesor(''),
                },
              ]
            : []
        }
        onLimpiar={listado.limpiarFiltros}
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar los entregables"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <EntregablesJuradoTable
            entregables={entregables}
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
          cantidadEnPagina={entregables.length}
          etiquetaPlural="entregables"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
