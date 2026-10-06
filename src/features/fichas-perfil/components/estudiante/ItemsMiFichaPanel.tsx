import { useState } from 'react';
import { Edit3, FilePlus, Plus, Trash2 } from 'lucide-react';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import type { Item } from '../../models/fichas-perfil';
import { toast } from '../../../../shared/hooks/useToast';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import IconButton from '../../../../shared/components/ui/IconButton';
import {
  getApiErrorMessage,
  hasApiErrorCode,
  isApiErrorWithStatus,
} from '../../../../shared/utils/api-error';
import AyudaTiposItem from '../AyudaTiposItem';
import ItemsFichaLista from '../ItemsFichaLista';
import AgregarItemForm from './AgregarItemForm';
import EditarItemForm from './EditarItemForm';

const RAIZ = 'flex flex-col gap-3';
const TITULO = 'text-base font-semibold text-on-surface';

function mensajeErrorEliminar(err: unknown): string {
  if (hasApiErrorCode(err, 'ITEM_CON_REVISIONES')) {
    return 'El ítem ya fue revisado por tu asesor y no puede eliminarse.';
  }
  if (isApiErrorWithStatus(err, 400)) return 'El ítem ya no existe.';
  return getApiErrorMessage(err, 'No se pudo eliminar el ítem.');
}

export default function ItemsMiFichaPanel() {
  const { items, itemsCargados, isLoading, isError, refetch, remover } = useItemsMiFicha();
  const [agregando, setAgregando] = useState(false);
  const [itemEditando, setItemEditando] = useState<Item | null>(null);
  const [itemAEliminar, setItemAEliminar] = useState<string | null>(null);

  function confirmarEliminar() {
    if (!itemAEliminar) return;
    remover.mutate(itemAEliminar, {
      onSuccess: () => {
        toast.success('Ítem eliminado', 'El ítem fue removido de tu ficha.');
        setItemAEliminar(null);
      },
      onError: (err) => {
        toast.error('Error al eliminar', mensajeErrorEliminar(err));
        setItemAEliminar(null);
      },
    });
  }

  const botonAgregar = (
    <Button icono={Plus} className="header-action" onClick={() => setAgregando(true)}>
      Agregar ítem
    </Button>
  );

  return (
    <div className={RAIZ}>
      <div className="section-header">
        <h2 className={TITULO}>Ítems de la ficha</h2>
        {botonAgregar}
      </div>
      <div>
        <AyudaTiposItem />
      </div>

      <ItemsFichaLista
        items={itemsCargados ? items : undefined}
        cargando={isLoading}
        error={isError}
        onReintentar={refetch}
        acciones={(item) => (
          <>
            <IconButton
              etiqueta={`Editar ítem ${item.tipoItem.nombre}`}
              icono={Edit3}
              onClick={() => setItemEditando(item)}
            />
            <IconButton
              tono="peligro"
              etiqueta={`Eliminar ítem ${item.tipoItem.nombre}`}
              icono={Trash2}
              disabled={remover.isPending}
              onClick={() => setItemAEliminar(item.id)}
            />
          </>
        )}
        vacio={
          <EmptyState
            icono={FilePlus}
            titulo="Tu ficha aún no tiene ítems"
            descripcion="Agrega el primero para empezar a construir tu ficha."
            accion={
              <Button icono={Plus} onClick={() => setAgregando(true)}>
                Agregar ítem
              </Button>
            }
          />
        }
      />

      {agregando && <AgregarItemForm onCerrar={() => setAgregando(false)} />}
      {itemEditando && (
        <EditarItemForm
          key={itemEditando.id}
          item={itemEditando}
          onCerrar={() => setItemEditando(null)}
        />
      )}
      {itemAEliminar && (
        <ConfirmDialog
          titulo="¿Eliminar ítem?"
          descripcion="El ítem será removido de tu ficha de perfil."
          consecuencias={['No se puede deshacer.']}
          labelConfirmar="Eliminar ítem"
          variante="peligro"
          cargando={remover.isPending}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setItemAEliminar(null)}
        />
      )}
    </div>
  );
}
