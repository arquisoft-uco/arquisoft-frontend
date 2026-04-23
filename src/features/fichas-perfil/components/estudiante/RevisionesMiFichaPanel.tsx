import { Eye, MessageSquare } from 'lucide-react';
import { useRevisionesMiFicha } from '../../hooks/useRevisionesMiFicha';
import { useItemsMiFicha } from '../../hooks/useItemsMiFicha';

export default function RevisionesMiFichaPanel() {
  const { revisiones, observacionesItems, isLoading } = useRevisionesMiFicha();
  const { tiposItem } = useItemsMiFicha();
  const { items } = useItemsMiFicha();

  const getNombreTipo = (tipoItemId: string) =>
    tiposItem.find((t) => t.id === tipoItemId)?.nombre ?? tipoItemId;

  if (isLoading) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-on-surface">Revisiones de Ítems</h3>

      {revisiones.map((rev) => {
        const item = items.find((i) => i.id === rev.itemId);
        const obsRev = observacionesItems.filter((o) => o.revisionItemId === rev.id);

        return (
          <div key={rev.id} className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface">
                <Eye size={14} className="mr-1 inline" aria-hidden />
                {item ? getNombreTipo(item.tipoItemId) : rev.itemId}
              </span>
              <span className="text-xs text-on-surface-secondary">
                {new Date(rev.fechaCreacion).toLocaleDateString('es-CO')}
              </span>
            </div>

            {obsRev.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-border pt-2">
                {obsRev.map((obs) => (
                  <div key={obs.id} className="flex items-start gap-2">
                    <MessageSquare size={12} className="mt-0.5 text-on-surface-secondary" aria-hidden />
                    <p className="text-xs text-on-surface-secondary">{obs.observacion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {revisiones.length === 0 && (
        <p className="py-8 text-center text-sm text-on-surface-secondary">No hay revisiones aún</p>
      )}
    </div>
  );
}
