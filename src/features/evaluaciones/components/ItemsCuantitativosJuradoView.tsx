import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Notice from '../../../shared/components/ui/Notice';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { Rol } from '../../../shared/models/rol';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useHasRole } from '../../../hooks/useHasRole';
import { useCategoriasItemCuantitativoJurado } from '../hooks/useCategoriasItemCuantitativoJurado';
import { useItemsCuantitativosJurado } from '../hooks/useItemsCuantitativosJurado';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import CategoriasItemCuantitativoJuradoPanel from './CategoriasItemCuantitativoJuradoPanel';
import ItemsCuantitativosJuradoTable from './ItemsCuantitativosJuradoTable';
import ModificarItemCuantitativoJuradoPanel from './ModificarItemCuantitativoJuradoPanel';
import RegistrarItemCuantitativoJuradoPanel from './RegistrarItemCuantitativoJuradoPanel';
import RemoverItemCuantitativoJuradoDialog from './RemoverItemCuantitativoJuradoDialog';

const ROLES_ADMINISTRAN = [Rol.Administrador];

type PanelItems =
  | { tipo: 'registrar' }
  | { tipo: 'modificar'; item: ItemCuantitativoJurado }
  | { tipo: 'remover'; item: ItemCuantitativoJurado };

export default function ItemsCuantitativosJuradoView() {
  const { data, isLoading, isError, error, refetch } = useItemsCuantitativosJurado();
  const categorias = useCategoriasItemCuantitativoJurado();
  const esAdministrador = useHasRole(ROLES_ADMINISTRAN);
  const [panel, setPanel] = useState<PanelItems | null>(null);

  function cerrarPanel() {
    setPanel(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="section-header">
        <p className="text-sm text-on-surface-secondary">
          Valores máximos con los que el jurado puntúa cada proyecto.
        </p>
        {esAdministrador && (
          <Button
            icono={Plus}
            className="header-action"
            onClick={() => setPanel({ tipo: 'registrar' })}
          >
            Registrar ítem
          </Button>
        )}
      </div>

      {isLoading && (
        <Skeleton variante="tabla" etiqueta="Cargando ítems cuantitativos del jurado" />
      )}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cuantitativos del jurado."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && categorias.isError && (
        <Notice variante="advertencia">No se pudieron cargar los nombres de las categorías.</Notice>
      )}

      {data && (
        <ItemsCuantitativosJuradoTable
          items={data}
          categorias={categorias.data}
          cargandoCategorias={categorias.isLoading}
          onEditar={esAdministrador ? (item) => setPanel({ tipo: 'modificar', item }) : undefined}
          onRemover={esAdministrador ? (item) => setPanel({ tipo: 'remover', item }) : undefined}
        />
      )}

      <CategoriasItemCuantitativoJuradoPanel />

      {panel?.tipo === 'registrar' && (
        <RegistrarItemCuantitativoJuradoPanel onCerrar={cerrarPanel} />
      )}
      {panel?.tipo === 'modificar' && (
        <ModificarItemCuantitativoJuradoPanel
          key={panel.item.id}
          item={panel.item}
          onCerrar={cerrarPanel}
        />
      )}
      {panel?.tipo === 'remover' && (
        <RemoverItemCuantitativoJuradoDialog
          key={panel.item.id}
          item={panel.item}
          onCerrar={cerrarPanel}
        />
      )}
    </div>
  );
}
