import { useFichasPerfilCoordinador } from '../../hooks/useFichasPerfilCoordinador';
import FichasPerfilTable from './FichasPerfilTable';

export default function ConsultarFichasPerfilCoordinador() {
  const { data, isLoading, isError, page, pageSize, goToPage } = useFichasPerfilCoordinador();

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
      <header>
        <h2 id="fichas-coordinador-titulo" className="text-xl font-semibold text-on-surface">
          Fichas de Perfil
        </h2>
        <p className="mt-1 text-sm text-on-surface-secondary">
          {totalElements} ficha{totalElements !== 1 ? 's' : ''} registrada{totalElements !== 1 ? 's' : ''}
        </p>
      </header>

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
