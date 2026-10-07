import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRespuestasNovedadCoordinadorRecibidas } from '../../hooks/useRespuestasNovedadCoordinadorRecibidas';
import ResumenListado from '../ResumenListado';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function RespuestasRecibidasPanel({ page, onPageChange }: Props) {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, pageSize } =
    useRespuestasNovedadCoordinadorRecibidas(page);
  const respuestas = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <ResumenListado total={data?.totalElements} singular="respuesta" plural="respuestas" />

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las respuestas"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <RespuestasRecibidasTable
            respuestas={respuestas}
            cargando={isLoading || (isPlaceholderData && respuestas.length === 0)}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={page}
          pageSize={pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={respuestas.length}
          etiquetaPlural="respuestas"
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
