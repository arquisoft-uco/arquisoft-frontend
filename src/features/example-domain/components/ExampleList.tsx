import { useQuery } from '@tanstack/react-query';
import { exampleDomainService } from '../services/exampleDomainService';
import type { ExampleItem } from '../models/ExampleItem';

export default function ExampleList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['example-items'],
    queryFn: () => exampleDomainService.getAll(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" aria-live="polite" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
        <p className="text-sm text-on-surface-secondary">
          Error al cargar los datos: {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    );
  }

  const items: ExampleItem[] = data?.content ?? [];

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <header>
        <h1 className="text-2xl font-bold text-on-surface">Example Domain</h1>
        <p className="mt-1 text-sm text-on-surface-secondary">
          Lista de elementos de ejemplo ({data?.totalElements ?? 0} en total)
        </p>
      </header>

      <section
        className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden"
        aria-label="Lista de elementos"
      >
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-on-surface-secondary">
            No hay elementos disponibles.
          </div>
        ) : (
          <table className="w-full text-sm" aria-label="Elementos de ejemplo">
            <thead>
              <tr className="border-b border-border bg-surface-secondary text-left">
                <th scope="col" className="px-6 py-3 font-semibold text-on-surface">ID</th>
                <th scope="col" className="px-6 py-3 font-semibold text-on-surface">Nombre</th>
                <th scope="col" className="px-6 py-3 font-semibold text-on-surface">Descripción</th>
                <th scope="col" className="px-6 py-3 font-semibold text-on-surface">Creado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors"
                >
                  <td className="px-6 py-3 text-on-surface-secondary">{item.id}</td>
                  <td className="px-6 py-3 font-medium text-on-surface">{item.name}</td>
                  <td className="px-6 py-3 text-on-surface-secondary">{item.description}</td>
                  <td className="px-6 py-3 text-on-surface-secondary">
                    {new Date(item.createdAt).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
