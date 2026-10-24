import { CheckCheck } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useMarcarRevisionItemVisualizada } from '../../hooks/useMarcarRevisionItemVisualizada';
import { useRevisionesMiFicha } from '../../hooks/useRevisionesMiFicha';
import RevisionesFichaTabla from '../RevisionesFichaTabla';

const ESTADO_REVISION_NUEVA = 'NUEVA';

function mensajeError(err: unknown): string {
  if (hasApiErrorCode(err, 'REVISION_ITEM_CERRADA')) {
    return 'La revisión está cerrada y ya no admite cambios.';
  }
  if (hasApiErrorCode(err, 'REVISION_ITEM_NO_ENCONTRADA')) return 'La revisión ya no existe.';
  if (hasApiErrorCode(err, 'FICHA_NO_PROPIETARIO')) return 'Esta revisión no pertenece a tu ficha.';
  return getApiErrorMessage(err, 'No se pudo marcar la revisión como visualizada.');
}

export default function RevisionesMiFichaPanel() {
  const revisiones = useRevisionesMiFicha();
  const marcar = useMarcarRevisionItemVisualizada();

  function marcarVisualizada(revisionItemId: string) {
    marcar.mutate(revisionItemId, {
      onSuccess: () => toast.success('Revisión marcada como visualizada'),
      onError: (err) => toast.error('No se pudo marcar la revisión', mensajeError(err)),
    });
  }

  return (
    <RevisionesFichaTabla
      {...revisiones}
      tituloVacio="Tu ficha aún no tiene revisiones"
      descripcionVacia="Cuando tu asesor revise un ítem y deje observaciones, lo verás aquí."
      acciones={(fila) => {
        if (fila.revision.estadoId !== ESTADO_REVISION_NUEVA) return null;
        return (
          <IconButton
            tono="primario"
            icono={CheckCheck}
            etiqueta={`Marcar como visualizada la revisión de ${fila.item?.tipoItem.nombre ?? 'un ítem'}`}
            rotulo="Marcar como visualizada"
            disabled={marcar.isPending && marcar.variables === fila.revision.id}
            onClick={() => marcarVisualizada(fila.revision.id)}
          />
        );
      }}
    />
  );
}
