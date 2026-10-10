import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import IconButton from '../../../../shared/components/ui/IconButton';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useRemoverRevisionItem } from '../../hooks/useRemoverRevisionItem';
import { useRevisionesFichaAsesor } from '../../hooks/useRevisionesFichaAsesor';
import RevisionesFichaTabla from '../RevisionesFichaTabla';

const ESTADO_REVISION_CERRADA = 'CERRADA';

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
          return (
            <IconButton
              tono="peligro"
              icono={Trash2}
              etiqueta={`Remover la revisión de ${fila.item?.tipoItem.nombre ?? 'un ítem'}`}
              rotulo="Remover revisión"
              disabled={remover.isPending && remover.variables === fila.revision.id}
              onClick={() => setRevisionARemover(fila.revision.id)}
            />
          );
        }}
      />
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
