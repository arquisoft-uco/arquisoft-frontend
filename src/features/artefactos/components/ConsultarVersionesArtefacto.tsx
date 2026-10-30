import PaginadorListado from '../../../shared/components/PaginadorListado';
import ErrorState from '../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import type {
  CatalogoArtefactos,
  ListadoVersionesArtefacto,
} from '../hooks/useListadoVersionesArtefacto';
import FiltrosVersionesArtefacto from './FiltrosVersionesArtefacto';
import VersionesArtefactoTable from './VersionesArtefactoTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'versión' : 'versiones'}`;
}

interface Props {
  listado: ListadoVersionesArtefacto;
  catalogo: CatalogoArtefactos;
  descripcionVacio: string;
}

export default function ConsultarVersionesArtefacto({
  listado,
  catalogo,
  descripcionVacio,
}: Props) {
  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const versiones = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <FiltrosVersionesArtefacto listado={listado} />

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
          <VersionesArtefactoTable
            versiones={versiones}
            artefactoDe={catalogo.artefactoDe}
            nombresCargando={catalogo.isLoading}
            descripcionVacio={descripcionVacio}
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
