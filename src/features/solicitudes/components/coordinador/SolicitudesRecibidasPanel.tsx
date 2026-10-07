import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useSolicitudesNovedadCoordinadorRecibidas } from '../../hooks/useSolicitudesNovedadCoordinadorRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import ResponderSolicitudForm from './ResponderSolicitudForm';
import SolicitudesRecibidasTable from './SolicitudesRecibidasTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'solicitud' : 'solicitudes'}`;
}

export default function SolicitudesRecibidasPanel() {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, ...paginacion } =
    useSolicitudesNovedadCoordinadorRecibidas();
  const solicitudes = data?.content ?? [];
  const [solicitudAResponder, setSolicitudAResponder] = useState<Solicitud | null>(null);

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

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
          page={paginacion.page}
          pageSize={paginacion.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={solicitudes.length}
          etiquetaPlural="solicitudes"
          onPageChange={paginacion.goToPage}
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
