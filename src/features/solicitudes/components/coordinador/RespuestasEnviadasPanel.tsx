import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRespuestasNovedadCoordinadorEnviadas } from '../../hooks/useRespuestasNovedadCoordinadorEnviadas';
import RespuestasEnviadasTable from './RespuestasEnviadasTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'respuesta' : 'respuestas'}`;
}

export default function RespuestasEnviadasPanel() {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, ...paginacion } =
    useRespuestasNovedadCoordinadorEnviadas();
  const respuestas = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las respuestas"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <RespuestasEnviadasTable
            respuestas={respuestas}
            cargando={isLoading || (isPlaceholderData && respuestas.length === 0)}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={paginacion.page}
          pageSize={paginacion.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={respuestas.length}
          etiquetaPlural="respuestas"
          onPageChange={paginacion.goToPage}
        />
      )}
    </div>
  );
}
