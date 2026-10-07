import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRespuestasNovedadCoordinadorEnviadas } from '../../hooks/useRespuestasNovedadCoordinadorEnviadas';
import ResumenListado from '../ResumenListado';
import RespuestasEnviadasTable from './RespuestasEnviadasTable';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function RespuestasEnviadasPanel({ page, onPageChange }: Props) {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, pageSize } =
    useRespuestasNovedadCoordinadorEnviadas(page);
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
          <RespuestasEnviadasTable
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
