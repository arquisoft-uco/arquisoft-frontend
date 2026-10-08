import type { ComponentType } from 'react';
import PaginadorListado from '../../../shared/components/PaginadorListado';
import ErrorState from '../../../shared/components/ui/ErrorState';
import type { Page } from '../../../shared/models/api-response';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
import ResumenListado from './ResumenListado';

const RAIZ = 'flex flex-col gap-4';

interface Consulta {
  data?: Page<RespuestaSolicitud>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  isPlaceholderData: boolean;
  refetch: () => unknown;
  pageSize: number;
}

interface Props {
  consulta: Consulta;
  page: number;
  onPageChange: (page: number) => void;
  Tabla: ComponentType<{ respuestas: RespuestaSolicitud[]; cargando: boolean }>;
}

export default function RespuestasPanel({ consulta, page, onPageChange, Tabla }: Props) {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, pageSize } =
    consulta;
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
          <Tabla
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
