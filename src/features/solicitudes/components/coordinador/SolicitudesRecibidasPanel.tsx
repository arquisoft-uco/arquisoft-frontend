import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useSolicitudesNovedadCoordinadorRecibidas } from '../../hooks/useSolicitudesNovedadCoordinadorRecibidas';
import SolicitudesRecibidasTable from './SolicitudesRecibidasTable';

export default function SolicitudesRecibidasPanel() {
  const { data, isLoading, isError, error, page, pageSize, goToPage } =
    useSolicitudesNovedadCoordinadorRecibidas();

  const totalElements = data?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-6" aria-labelledby="solicitudes-recibidas-titulo">
      <header className="section-header">
        <div>
          <h2 id="solicitudes-recibidas-titulo" className="text-lg font-semibold text-on-surface">
            Novedades recibidas
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
            <span className="sr-only">Cargando solicitudes recibidas</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
          <p className="text-sm text-on-surface-secondary">
            {getApiErrorMessage(error, 'No se pudieron cargar las solicitudes recibidas.')}
          </p>
        </div>
      )}

      {data && (
        <SolicitudesRecibidasTable
          solicitudes={data.content}
          totalElements={totalElements}
          totalPages={data.totalPages}
          page={page}
          pageSize={pageSize}
          onPageChange={goToPage}
        />
      )}
    </section>
  );
}
