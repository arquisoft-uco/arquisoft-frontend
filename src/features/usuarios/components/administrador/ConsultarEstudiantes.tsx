import { RefreshCw } from 'lucide-react';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import EstudiantesTable from './EstudiantesTable';

export default function ConsultarEstudiantes() {
  const { data, isLoading, isError, error, isFetching, refetch, page, pageSize, goToPage } =
    useEstudiantes();

  const totalElements = data?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-6" aria-labelledby="estudiantes-titulo">
      <header className="section-header">
        <div>
          <h2 id="estudiantes-titulo" className="text-lg font-semibold text-on-surface">
            Estudiantes
          </h2>
          {data && (
            <p className="mt-1 text-sm text-on-surface-secondary">
              {totalElements} estudiante{totalElements !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="header-action inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-nav-hover-bg disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
        >
          <RefreshCw size={16} aria-hidden className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            role="status"
          >
            <span className="sr-only">Cargando estudiantes...</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
          <p className="text-sm text-on-surface-secondary">
            {getApiErrorMessage(
              error,
              'No se pudieron cargar los estudiantes. Intenta nuevamente.',
            )}
          </p>
        </div>
      )}

      {data && (
        <EstudiantesTable
          estudiantes={data.content}
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
