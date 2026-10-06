import { useState } from 'react';
import { Plus } from 'lucide-react';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { Rol } from '../../../shared/models/rol';
import { useHasRole } from '../../../hooks/useHasRole';
import { useItemsCualitativosJurado } from '../hooks/useItemsCualitativosJurado';
import ItemsCualitativosJuradoTable from './ItemsCualitativosJuradoTable';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import ModificarItemCualitativoJurado from './ModificarItemCualitativoJurado';
import RegistrarItemCualitativoJurado from './RegistrarItemCualitativoJurado';

const ROLES_REGISTRAN = [Rol.Administrador];

export default function ItemsCualitativosJuradoView() {
  const { data, isLoading, isError, error } = useItemsCualitativosJurado();
  const esAdministrador = useHasRole(ROLES_REGISTRAN);
  const [registrando, setRegistrando] = useState(false);
  const [editando, setEditando] = useState<ItemCualitativoJurado | null>(null);

  if (registrando) {
    return (
      <section className="flex flex-col gap-6 animate-fade-up">
        <RegistrarItemCualitativoJurado onCerrar={() => setRegistrando(false)} />
      </section>
    );
  }

  if (editando) {
    return (
      <section className="flex flex-col gap-6 animate-fade-up">
        <ModificarItemCualitativoJurado item={editando} onCerrar={() => setEditando(null)} />
      </section>
    );
  }

  return (
    <section
      className="flex flex-col gap-6 animate-fade-up"
      aria-labelledby="items-cualitativos-jurado-titulo"
    >
      <header className="section-header">
        <h2 id="items-cualitativos-jurado-titulo" className="text-xl font-semibold text-on-surface">
          Ítems cualitativos del jurado
        </h2>
        {esAdministrador && (
          <button
            type="button"
            onClick={() => setRegistrando(true)}
            className="header-action inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover sm:py-2"
          >
            <Plus size={16} aria-hidden />
            Registrar ítem
          </button>
        )}
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

      {data && (
        <ItemsCualitativosJuradoTable
          items={data}
          onEditar={esAdministrador ? setEditando : undefined}
        />
      )}
    </section>
  );
}
