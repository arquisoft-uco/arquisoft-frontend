import { useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEliminarSolicitudNovedadCoordinador } from '../../hooks/useEliminarSolicitudNovedadCoordinador';
import { useSolicitudesNovedadCoordinadorEnviadas } from '../../hooks/useSolicitudesNovedadCoordinadorEnviadas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesEnviadasTable from './SolicitudesEnviadasTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'solicitud' : 'solicitudes'}`;
}

export default function SolicitudesEnviadasPanel() {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, ...paginacion } =
    useSolicitudesNovedadCoordinadorEnviadas();
  const solicitudes = data?.content ?? [];

  const { mutate: eliminar, isPending: eliminando } = useEliminarSolicitudNovedadCoordinador();
  const [pendienteEliminar, setPendienteEliminar] = useState<Solicitud | null>(null);

  function handleConfirmarEliminar() {
    if (!pendienteEliminar) return;
    eliminar(pendienteEliminar.id, {
      onSuccess: () => {
        toast.success('Solicitud eliminada', 'La solicitud de novedad fue eliminada correctamente.');
        setPendienteEliminar(null);
      },
      onError: (err) => {
        toast.error(
          'No se pudo eliminar la solicitud',
          getApiErrorMessage(err, 'Inténtalo nuevamente.'),
        );
        setPendienteEliminar(null);
      },
    });
  }

  function handleCancelarEliminar() {
    if (eliminando) return;
    setPendienteEliminar(null);
  }

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
          <SolicitudesEnviadasTable
            solicitudes={solicitudes}
            cargando={isLoading || (isPlaceholderData && solicitudes.length === 0)}
            eliminando={eliminando}
            onEliminar={setPendienteEliminar}
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

      {pendienteEliminar && (
        <ConfirmDialog
          variante="peligro"
          titulo="¿Eliminar solicitud?"
          descripcion={`Se eliminará la solicitud enviada a ${pendienteEliminar.destinatario.nombre}. Esta acción no se puede deshacer.`}
          labelConfirmar="Eliminar"
          cargando={eliminando}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={handleCancelarEliminar}
        />
      )}
    </div>
  );
}
