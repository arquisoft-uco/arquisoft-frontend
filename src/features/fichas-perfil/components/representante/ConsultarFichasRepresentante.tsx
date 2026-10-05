import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';
import { useFichasRepresentante } from '../../hooks/useFichasRepresentante';
import type { FichaPerfilRepresentante } from '../../models/FichaPerfilRepresentante';
import FichasRepresentanteFiltros from './FichasRepresentanteFiltros';
import FichasRepresentanteListado from './FichasRepresentanteListado';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'ficha' : 'fichas'}`;
}

interface Props {
  onSeleccionar: (ficha: FichaPerfilRepresentante) => void;
}

export default function ConsultarFichasRepresentante({ onSeleccionar }: Props) {
  const listado = useFichasRepresentante();
  const estados = useEstadosFicha();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, filtros } =
    listado;
  const fichas = data?.content ?? [];
  const hayFiltros =
    filtros.titulo.trim() !== '' ||
    filtros.asesorNombre.trim() !== '' ||
    filtros.asesorEmail.trim() !== '' ||
    filtros.estadoIds.length > 0;
  const recargandoSinFilas = isPlaceholderData && fichas.length === 0 && !hayFiltros;

  return (
    <div className={RAIZ}>
      <FichasRepresentanteFiltros listado={listado} estados={estados} />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las fichas de perfil"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <FichasRepresentanteListado
            fichas={fichas}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onSeleccionar={onSeleccionar}
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
          cantidadEnPagina={fichas.length}
          etiquetaPlural="fichas"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
