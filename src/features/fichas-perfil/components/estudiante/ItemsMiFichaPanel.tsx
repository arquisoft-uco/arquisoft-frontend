import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';
import { toast } from '../../../../shared/hooks/useToast';

export default function ItemsMiFichaPanel() {
  const { fichaId, items, tiposItem, agregar, modificar, remover } = useItemsMiFicha();

  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false);
  const [nuevoItemTipoId, setNuevoItemTipoId] = useState('');
  const [nuevoItemContenido, setNuevoItemContenido] = useState('');
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);
  const [editContenido, setEditContenido] = useState('');

  const handleAgregar = () => {
    if (!nuevoItemTipoId || !nuevoItemContenido.trim() || !fichaId) return;
    agregar.mutate(
      { fichaPerfilId: fichaId, tipoItemId: nuevoItemTipoId, contenido: nuevoItemContenido },
      {
        onSuccess: () => {
          setNuevoItemTipoId('');
          setNuevoItemContenido('');
          setMostrarFormAgregar(false);
          toast.success('Ítem agregado', 'El ítem se registró correctamente.');
        },
        onError: () => toast.error('Error al agregar', 'No se pudo registrar el ítem.'),
      },
    );
  };

  const handleIniciarEdicion = (itemId: string, contenido: string) => {
    setEditandoItemId(itemId);
    setEditContenido(contenido);
  };

  const handleGuardarEdicion = (itemId: string) => {
    modificar.mutate(
      { itemId, contenido: editContenido },
      {
        onSuccess: () => {
          setEditandoItemId(null);
          toast.success('Ítem actualizado', 'El contenido se guardó correctamente.');
        },
        onError: () => toast.error('Error al modificar', 'No se pudo actualizar el ítem.'),
      },
    );
  };

  const handleEliminar = (itemId: string) => {
    remover.mutate(itemId, {
      onSuccess: () => toast.success('Ítem eliminado', 'El ítem fue removido de tu ficha.'),
      onError: () => toast.error('Error al eliminar', 'No se pudo eliminar el ítem.'),
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

      {mostrarFormAgregar && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              value={nuevoItemTipoId}
              onChange={(e) => setNuevoItemTipoId(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              aria-label="Tipo de ítem"
            >
              <option value="">Tipo de ítem...</option>
              {tiposItem.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Contenido del ítem"
              value={nuevoItemContenido}
              onChange={(e) => setNuevoItemContenido(e.target.value)}
              maxLength={200}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary sm:col-span-2"
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarFormAgregar(false)}
              className="rounded-lg border border-border px-2 py-1 text-xs text-on-surface hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAgregar}
              disabled={!nuevoItemTipoId || !nuevoItemContenido.trim() || !fichaId || agregar.isPending}
              className="rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-surface p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="inline-block rounded bg-primary-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                {item.tipoItem.nombre}
              </span>
              {editandoItemId === item.id ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={editContenido}
                    onChange={(e) => setEditContenido(e.target.value)}
                    maxLength={200}
                    className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleGuardarEdicion(item.id)}
                    disabled={modificar.isPending}
                    className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoItemId(null)}
                    className="rounded border border-border px-2 py-1 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-on-surface">{item.contenido}</p>
              )}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleIniciarEdicion(item.id, item.contenido)}
                className="rounded p-1 text-on-surface-secondary hover:text-primary"
                aria-label={`Editar ítem ${item.tipoItem.nombre}`}
              >
                <Edit3 size={14} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => handleEliminar(item.id)}
                disabled={remover.isPending}
                className="rounded p-1 text-on-surface-secondary hover:text-red-500 disabled:opacity-50"
                aria-label={`Eliminar ítem ${item.tipoItem.nombre}`}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <p className="py-8 text-center text-sm text-on-surface-secondary">
          No hay ítems en la ficha
        </p>
      )}
    </div>
  );
}
