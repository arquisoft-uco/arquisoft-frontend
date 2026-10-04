import { useState } from 'react';
import { Edit3, FilePlus, Plus, Trash2 } from 'lucide-react';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Badge from '../../../../shared/components/ui/Badge';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import IconButton from '../../../../shared/components/ui/IconButton';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import {
  getApiErrorMessage,
  hasApiErrorCode,
  isApiErrorWithStatus,
} from '../../../../shared/utils/api-error';
import AgregarItemForm from './AgregarItemForm';
import EditarItemForm from './EditarItemForm';

function mensajeErrorEliminar(err: unknown): string {
  if (hasApiErrorCode(err, 'ITEM_CON_REVISIONES')) {
    return 'El ítem ya fue revisado por tu asesor y no puede eliminarse.';
  }
  if (isApiErrorWithStatus(err, 400)) return 'El ítem ya no existe.';
  return getApiErrorMessage(err, 'No se pudo eliminar el ítem.');
}

export default function ItemsMiFichaPanel() {
  const { items, isLoading, isError, refetch, remover } = useItemsMiFicha();

  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false);
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);
  const [itemIdAEliminar, setItemIdAEliminar] = useState<string | null>(null);

  const handleEliminar = (itemId: string) => {
    setItemIdAEliminar(itemId);
  };

  const handleConfirmarEliminar = () => {
    if (!itemIdAEliminar) return;
    remover.mutate(itemIdAEliminar, {
      onSuccess: () => {
        toast.success('Ítem eliminado', 'El ítem fue removido de tu ficha.');
        setItemIdAEliminar(null);
      },
      onError: (err) => {
        toast.error('Error al eliminar', mensajeErrorEliminar(err));
        setItemIdAEliminar(null);
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-surface">Ítems de la Ficha</h3>
        <button
          type="button"
          onClick={() => setMostrarFormAgregar(!mostrarFormAgregar)}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} aria-hidden /> Agregar Ítem
        </button>
      </div>

      {mostrarFormAgregar && <AgregarItemForm onCerrar={() => setMostrarFormAgregar(false)} />}

      {isLoading && <Skeleton variante="tarjetas" etiqueta="Cargando ítems de la ficha..." />}

      {isError && !isLoading && (
        <ErrorState
          titulo="No se pudieron cargar los ítems de tu ficha"
          descripcion="Intenta de nuevo más tarde."
          onReintentar={refetch}
        />
      )}

      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-surface p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge variante="neutro">{item.tipoItem.nombre}</Badge>
              {editandoItemId === item.id ? (
                <EditarItemForm item={item} onCerrar={() => setEditandoItemId(null)} />
              ) : (
                <p className="mt-1 text-sm text-on-surface">{item.contenido}</p>
              )}
            </div>
            <div className="flex gap-1">
              <IconButton
                etiqueta={`Editar ítem ${item.tipoItem.nombre}`}
                icono={Edit3}
                onClick={() => setEditandoItemId(item.id)}
              />
              <IconButton
                tono="peligro"
                etiqueta={`Eliminar ítem ${item.tipoItem.nombre}`}
                icono={Trash2}
                disabled={remover.isPending}
                onClick={() => handleEliminar(item.id)}
              />
            </div>
          </div>
        </div>
      ))}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icono={FilePlus}
          titulo="Tu ficha aún no tiene ítems"
          descripcion="Agrega el primero con «Agregar Ítem»."
        />
      )}

      {itemIdAEliminar && (
        <ConfirmDialog
          titulo="¿Eliminar ítem?"
          descripcion="Esta acción no se puede deshacer. El ítem será removido de tu ficha de perfil."
          labelConfirmar="Eliminar"
          variante="peligro"
          cargando={remover.isPending}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setItemIdAEliminar(null)}
        />
      )}
    </div>
  );
}
