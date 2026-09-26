import { useCoordinadores } from '../../hooks/useCoordinadores';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import CoordinadoresTable from './CoordinadoresTable';

interface Props {
  accionHeader?: React.ReactNode;
  formulario?: React.ReactNode;
}

export default function ConsultarCoordinadores({ accionHeader, formulario }: Props) {
  const { data, isLoading, isError, error, page, pageSize, goToPage } = useCoordinadores();

  const totalElements = data?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-6" aria-labelledby="coordinadores-titulo">
      <header className="section-header">
        <div>
          <h2 id="coordinadores-titulo" className="text-lg font-semibold text-on-surface">
            Coordinadores
          </h2>
          {data && (
            <p className="mt-1 text-sm text-on-surface-secondary">
              {totalElements} coordinador{totalElements !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        {accionHeader}
      </header>

      {formulario}

      {isLoading && (
        <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            role="status"
          >
            <span className="sr-only">Cargando coordinadores...</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
          <p className="text-sm text-on-surface-secondary">
            {getApiErrorMessage(
              error,
              'No se pudieron cargar los coordinadores. Intenta nuevamente.',
            )}
          </p>
        </div>
      )}

      {data && (
        <CoordinadoresTable
          coordinadores={data.content}
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
