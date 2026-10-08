import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useSolicitudesNovedadCoordinadorRecibidas } from '../../hooks/useSolicitudesNovedadCoordinadorRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import ResumenListado from '../ResumenListado';
import ResponderSolicitudForm from './ResponderSolicitudForm';
import SolicitudesRecibidasTable from './SolicitudesRecibidasTable';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesRecibidasPanel({ page, onPageChange }: Props) {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, pageSize } =
    useSolicitudesNovedadCoordinadorRecibidas(page);
  const solicitudes = data?.content ?? [];
  const [solicitudAResponder, setSolicitudAResponder] = useState<Solicitud | null>(null);

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
            onResponder={setSolicitudAResponder}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={page}
          pageSize={pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={solicitudes.length}
          etiquetaPlural="solicitudes"
          onPageChange={onPageChange}
        />
      )}

      {solicitudAResponder && (
        <ResponderSolicitudForm
          solicitud={solicitudAResponder}
          onCerrar={() => setSolicitudAResponder(null)}
        />
      )}
    </div>
  );
}
