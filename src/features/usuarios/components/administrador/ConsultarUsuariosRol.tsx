import { RefreshCw } from 'lucide-react';
import type { Page } from '../../../../shared/models/api-response';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import type { UsuarioRolListado } from '../../models/UsuarioRolListado';
import UsuariosRolTable from './UsuariosRolTable';

interface Consulta<T extends UsuarioRolListado> {
  data: Page<T> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  refetch: () => unknown;
  page: number;
  pageSize: number;
  goToPage: (page: number) => void;
}

interface Props<T extends UsuarioRolListado> {
  titulo: string;
  idTitulo: string;
  etiquetaSingular: string;
  etiquetaPlural: string;
  consulta: Consulta<T>;
  onRemover?: (usuario: T) => void;
}

export default function ConsultarUsuariosRol<T extends UsuarioRolListado>({
  titulo,
  idTitulo,
  etiquetaSingular,
  etiquetaPlural,
  consulta,
  onRemover,
}: Props<T>) {
  const { data, isLoading, isError, error, isFetching, refetch, page, pageSize, goToPage } =
    consulta;

  const totalElements = data?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-6" aria-labelledby={idTitulo}>
      <header className="section-header">
        <div>
          <h2 id={idTitulo} className="text-lg font-semibold text-on-surface">
            {titulo}
          </h2>
          {data && (
            <p className="mt-1 text-sm text-on-surface-secondary">
              {totalElements} {totalElements !== 1 ? etiquetaPlural : etiquetaSingular}
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
            <span className="sr-only">Cargando {etiquetaPlural}...</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
          <p className="text-sm text-on-surface-secondary">
            {getApiErrorMessage(
              error,
              `No se pudieron cargar los ${etiquetaPlural}. Intenta nuevamente.`,
            )}
          </p>
        </div>
      )}

      {data && (
        <UsuariosRolTable
          usuarios={data.content}
          totalElements={totalElements}
          totalPages={data.totalPages}
          page={page}
          pageSize={pageSize}
          onPageChange={goToPage}
          titulo={titulo}
          etiquetaSingular={etiquetaSingular}
          etiquetaPlural={etiquetaPlural}
          onRemover={onRemover}
        />
      )}
    </section>
  );
}
