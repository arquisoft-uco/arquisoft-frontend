import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import type { Page } from '../../../../shared/models/api-response';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import type { Solicitud } from '../../models/Solicitud';
import ResumenListado from '../ResumenListado';
import type { TipoSolicitudUi } from './SelectorTipoSolicitud';
import SolicitudesEnviadasTable from './SolicitudesEnviadasTable';

const RAIZ = 'flex flex-col gap-4';

interface Consulta {
  data?: Page<Solicitud>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  isPlaceholderData: boolean;
  refetch: () => unknown;
  page: number;
  pageSize: number;
  goToPage: (page: number) => void;
}

interface Props {
  consulta: Consulta;
  tipo: TipoSolicitudUi;
  eliminando?: boolean;
  onEliminar?: (solicitud: Solicitud) => void;
}

export default function ListadoSolicitudesEnviadas({
  consulta,
  tipo,
  eliminando,
  onEliminar,
}: Props) {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = consulta;
  const solicitudes = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <ResumenListado total={data?.totalElements} singular="solicitud" plural="solicitudes" />

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las solicitudes"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <SolicitudesEnviadasTable
            tipo={tipo}
            solicitudes={solicitudes}
            cargando={isLoading || (isPlaceholderData && solicitudes.length === 0)}
            eliminando={eliminando}
            onEliminar={onEliminar}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={consulta.page}
          pageSize={consulta.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={solicitudes.length}
          etiquetaPlural="solicitudes"
          onPageChange={consulta.goToPage}
        />
      )}
    </div>
  );
}
