import PaginadorListado from '../../../shared/components/PaginadorListado';
import ErrorState from '../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import type { ConsultaListadoSolicitudes } from '../models/ConsultaListadoSolicitudes';
import type { Solicitud } from '../models/Solicitud';
import ResumenListado from './ResumenListado';
import type { TipoSolicitudRecibidaUi } from './SelectorTipoSolicitud';
import SolicitudesRecibidasTable from './SolicitudesRecibidasTable';
import type { ReceptorSolicitud } from './SolicitudesRecibidasTable';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  consulta: ConsultaListadoSolicitudes;
  receptor: ReceptorSolicitud;
  tipo?: TipoSolicitudRecibidaUi;
  onResponder?: (solicitud: Solicitud) => void;
}

export default function ListadoSolicitudesRecibidas({
  consulta,
  receptor,
  tipo,
  onResponder,
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
          <SolicitudesRecibidasTable
            solicitudes={solicitudes}
            cargando={isLoading || (isPlaceholderData && solicitudes.length === 0)}
            receptor={receptor}
            tipo={tipo}
            onResponder={onResponder}
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
