import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useArtefactosAsesor } from '../../hooks/useArtefactosAsesor';
import ArtefactosAsesorTable from './ArtefactosAsesorTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'artefacto' : 'artefactos'}`;
}

export default function ConsultarArtefactosAsignadosAsesor() {
  const listado = useArtefactosAsesor();
  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const artefactos = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar artefactos',
          placeholder: 'Buscar por documento, proyecto o repositorio',
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
            titulo="No se pudieron cargar los artefactos"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <ArtefactosAsesorTable
            artefactos={artefactos}
            cargando={isLoading}
            hayFiltros={listado.hayFiltros}
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
          cantidadEnPagina={artefactos.length}
          etiquetaPlural="artefactos"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
