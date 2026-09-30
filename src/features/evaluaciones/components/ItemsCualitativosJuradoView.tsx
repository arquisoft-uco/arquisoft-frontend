import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useItemsCualitativosJurado } from '../hooks/useItemsCualitativosJurado';
import ItemsCualitativosJuradoTable from './ItemsCualitativosJuradoTable';

export default function ItemsCualitativosJuradoView() {
  const { data, isLoading, isError, error } = useItemsCualitativosJurado();

  return (
    <section
      className="flex flex-col gap-6 animate-fade-up"
      aria-labelledby="items-cualitativos-jurado-titulo"
    >
      <header className="section-header">
        <h2 id="items-cualitativos-jurado-titulo" className="text-xl font-semibold text-on-surface">
          Ítems cualitativos del jurado
        </h2>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            role="status"
          >
            <span className="sr-only">Cargando ítems cualitativos del jurado</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
          <p className="text-sm text-on-surface-secondary">
            {getApiErrorMessage(
              error,
              'No se pudieron cargar los ítems cualitativos del jurado. Intenta nuevamente.',
            )}
          </p>
        </div>
      )}

      {data && <ItemsCualitativosJuradoTable items={data} />}
    </section>
  );
}
