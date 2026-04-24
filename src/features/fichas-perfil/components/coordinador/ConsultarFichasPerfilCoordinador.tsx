import { RefreshCw } from 'lucide-react';
import { useFichasPerfilCoordinador } from '../../hooks/useFichasPerfilCoordinador';
import FichasPerfilTable from './FichasPerfilTable';

interface Props {
  accionHeader?: React.ReactNode;
  formulario?: React.ReactNode;
}

export default function ConsultarFichasPerfilCoordinador({ accionHeader, formulario }: Props) {
  const { data, isLoading, isError, page, pageSize, goToPage, refetch } = useFichasPerfilCoordinador();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando fichas de perfil...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
        <p className="text-sm text-on-surface-secondary">
          No se pudieron cargar las fichas de perfil. Intenta nuevamente.
        </p>
      </div>
    );
  }

  const fichas = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <section className="flex flex-col gap-6" aria-labelledby="fichas-coordinador-titulo">
      <header className="flex items-center justify-between">
        <div>
          <h2 id="fichas-coordinador-titulo" className="text-xl font-semibold text-on-surface">
            Fichas de Perfil
          </h2>
          <p className="mt-1 text-sm text-on-surface-secondary">
            {totalElements} ficha{totalElements !== 1 ? 's' : ''} registrada{totalElements !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accionHeader}
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted"
          >
            <RefreshCw size={16} aria-hidden /> Actualizar
          </button>
        </div>
      </header>
      {formulario}

      <FichasPerfilTable
        fichas={fichas}
        totalElements={totalElements}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        onPageChange={goToPage}
      />
    </section>
  );
}
