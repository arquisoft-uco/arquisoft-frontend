import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useArtefactosAsesor } from '../../hooks/useArtefactosAsesor';
import { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import FiltrosVersionesArtefactoAsesor from './FiltrosVersionesArtefactoAsesor';
import VersionesArtefactoAsesorTable from './VersionesArtefactoAsesorTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'versión' : 'versiones'}`;
}

export default function ConsultarVersionesArtefactoAsesor() {
  const listado = useVersionesArtefactoAsesor();
  const catalogo = useArtefactosAsesor();
  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const versiones = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <FiltrosVersionesArtefactoAsesor listado={listado} />

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
          <VersionesArtefactoAsesorTable
            versiones={versiones}
            artefactoDe={catalogo.artefactoDe}
            nombresCargando={catalogo.isLoading}
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
          cantidadEnPagina={versiones.length}
          etiquetaPlural="versiones"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
