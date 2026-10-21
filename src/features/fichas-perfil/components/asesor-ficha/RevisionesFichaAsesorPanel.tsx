import { useState } from 'react';
import { MessageSquarePlus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useRemoverRevisionItem } from '../../hooks/useRemoverRevisionItem';
import { useRevisionesFichaAsesor } from '../../hooks/useRevisionesFichaAsesor';
import { ESTADO_REVISION_CERRADA } from '../../utils/estado-revision';
import RevisionesFichaTabla from '../RevisionesFichaTabla';
import AgregarObservacionItemPanel from './AgregarObservacionItemPanel';

function mensajeError(err: unknown): string {
  if (hasApiErrorCode(err, 'REVISION_ITEM_CERRADA')) {
    return 'La revisión está cerrada y ya no admite cambios.';
  }
  if (hasApiErrorCode(err, 'REVISION_ITEM_NO_ENCONTRADA')) return 'La revisión ya no existe.';
  if (hasApiErrorCode(err, 'FICHA_NO_PERTENECE_ASESOR')) return 'Esta ficha no está asignada a ti.';
  return getApiErrorMessage(err, 'No se pudo remover la revisión.');
}

interface Props {
  fichaPerfilId: string;
}

export default function RevisionesFichaAsesorPanel({ fichaPerfilId }: Props) {
  const revisiones = useRevisionesFichaAsesor(fichaPerfilId);
  const remover = useRemoverRevisionItem(fichaPerfilId);
  const [revisionARemover, setRevisionARemover] = useState<string | null>(null);
  const [observacionDe, setObservacionDe] = useState<{
    revisionId: string;
    nombreItem: string;
  } | null>(null);

  function confirmarRemover() {
    if (!revisionARemover) return;
    remover.mutate(revisionARemover, {
      onSuccess: () => {
        toast.success('Revisión removida');
        setRevisionARemover(null);
        if (revisiones.page > 0 && revisiones.filas.length === 1) {
          revisiones.goToPage(revisiones.page - 1);
        }
      },
      onError: (err) => {
        toast.error('No se pudo remover la revisión', mensajeError(err));
        setRevisionARemover(null);
      },
    });
  }

  return (
    <>
      <RevisionesFichaTabla
        {...revisiones}
        tituloVacio="Esta ficha aún no tiene revisiones"
        descripcionVacia="Cuando revises un ítem de esta ficha, lo verás aquí."
        acciones={(fila) => {
          if (fila.revision.estadoId === ESTADO_REVISION_CERRADA) return null;
          const nombreItem = fila.item?.tipoItem.nombre ?? 'un ítem';
          return (
            <RowMenu
              etiqueta={`Acciones de la revisión de ${nombreItem}`}
              acciones={[
                {
                  etiqueta: 'Agregar observación',
                  icono: MessageSquarePlus,
                  onSeleccionar: () =>
                    setObservacionDe({ revisionId: fila.revision.id, nombreItem }),
                },
                {
                  etiqueta: 'Remover revisión',
                  icono: Trash2,
                  peligro: true,
                  deshabilitada: remover.isPending && remover.variables === fila.revision.id,
                  onSeleccionar: () => setRevisionARemover(fila.revision.id),
                },
              ]}
            />
          );
        }}
      />
      {observacionDe && (
        <AgregarObservacionItemPanel
          revisionItemId={observacionDe.revisionId}
          fichaPerfilId={fichaPerfilId}
          nombreItem={observacionDe.nombreItem}
          onCerrar={() => setObservacionDe(null)}
        />
      )}
      {revisionARemover && (
        <ConfirmDialog
          titulo="¿Remover esta revisión?"
          descripcion="La revisión dejará de aparecer en la ficha."
          consecuencias={[
            'Se borran también sus observaciones.',
            'El ítem queda sin revisión: podrás agregar otra o removerlo.',
          ]}
          labelConfirmar="Remover revisión"
          variante="peligro"
          cargando={remover.isPending}
          onConfirmar={confirmarRemover}
          onCancelar={() => setRevisionARemover(null)}
        />
      )}
    </>
  );
}
