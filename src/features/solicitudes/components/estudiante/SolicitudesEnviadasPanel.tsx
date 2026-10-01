import { useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEliminarSolicitudNovedadCoordinador } from '../../hooks/useEliminarSolicitudNovedadCoordinador';
import { useSolicitudesNovedadCoordinadorEnviadas } from '../../hooks/useSolicitudesNovedadCoordinadorEnviadas';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesEnviadasTable from './SolicitudesEnviadasTable';

export default function SolicitudesEnviadasPanel() {
  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    goToPage,
  } = useSolicitudesNovedadCoordinadorEnviadas();

  const { mutate: eliminar, isPending: eliminando } = useEliminarSolicitudNovedadCoordinador();
  const [pendienteEliminar, setPendienteEliminar] = useState<Solicitud | null>(null);

  const totalElements = data?.totalElements ?? 0;

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
    <section className="flex flex-col gap-6" aria-labelledby="solicitudes-enviadas-titulo">
      <header className="section-header">
        <div>
          <h2 id="solicitudes-enviadas-titulo" className="text-lg font-semibold text-on-surface">
            Novedades enviadas al coordinador
          </h2>
          {data && (
            <p className="mt-1 text-sm text-on-surface-secondary">
              {totalElements} solicitud{totalElements !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            role="status"
          >
            <span className="sr-only">Cargando solicitudes enviadas</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
          <p className="text-sm text-on-surface-secondary">
            {getApiErrorMessage(error, 'No se pudieron cargar las solicitudes enviadas.')}
          </p>
        </div>
      )}

      {data && (
        <SolicitudesEnviadasTable
          solicitudes={data.content}
          totalElements={totalElements}
          totalPages={data.totalPages}
          page={page}
          pageSize={pageSize}
          eliminando={eliminando}
          onPageChange={goToPage}
          onEliminar={setPendienteEliminar}
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
    </section>
  );
}
