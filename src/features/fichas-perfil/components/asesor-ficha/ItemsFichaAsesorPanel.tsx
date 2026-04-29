import { useItemsFichaAsesor } from '../../hooks/useItemsFichaAsesor';

interface Props {
  fichaPerfilId: string;
}

export default function ItemsFichaAsesorPanel({ fichaPerfilId }: Props) {
  const { data: items = [], isLoading, isError } = useItemsFichaAsesor(fichaPerfilId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10" aria-live="polite" aria-busy="true">
        <div
          className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando ítems...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
        <p className="text-sm text-on-surface-secondary">
          No se pudieron cargar los ítems. Intenta nuevamente.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm text-on-surface-secondary">Esta ficha no tiene ítems registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" aria-label="Ítems de la ficha">
      <h3 className="text-sm font-semibold text-on-surface">Ítems de la Ficha</h3>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-surface p-3">
          <span className="inline-block rounded bg-primary-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
            {item.tipoItem.nombre}
          </span>
          <p className="mt-2 text-sm text-on-surface">{item.contenido}</p>
        </div>
      ))}
    </div>
  );
}
