import { useState } from 'react';
import { Plus } from 'lucide-react';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
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
  const { data, isLoading, isError, error, refetch } = useItemsCualitativosJurado();
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

      {isLoading && <Skeleton variante="tabla" etiqueta="Cargando ítems cualitativos del jurado" />}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cualitativos del jurado."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
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
