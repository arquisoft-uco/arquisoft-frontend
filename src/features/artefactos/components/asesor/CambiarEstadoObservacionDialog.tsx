import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useCambiarEstadoObservacion } from '../../hooks/useCambiarEstadoObservacion';
import type { CambiarEstadoObservacionRequest } from '../../models/CambiarEstadoObservacionRequest';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import {
  decisionObservacionYaNoAplica,
  mensajeDeErrorCambiarEstadoObservacion,
} from '../../utils/errores-cambiar-estado-observacion';
import { ARTEFACTO_OMITIDO } from '../../utils/errores-omitir-artefacto';
import { ARTEFACTO_ASESOR_NO_PROPIETARIO } from '../../utils/errores-registrar-revision';

interface Props {
  observacion: ObservacionRevision;
  estado: CambiarEstadoObservacionRequest['estado'];
  version: VersionArtefacto;
  revisionAsesorId: string;
  onCerrar: () => void;
  onSalir?: () => void;
}

export default function CambiarEstadoObservacionDialog({
  observacion,
  estado,
  version,
  revisionAsesorId,
  onCerrar,
  onSalir,
}: Props) {
  const { mutate, isPending } = useCambiarEstadoObservacion();
  const cerrando = estado === 'CERRADA';
  const siguiente = version.version + 1;

  function handleConfirmar() {
    mutate(
      { observacionId: observacion.id, revisionAsesorId, estado },
      {
        onSuccess: () => {
          toast.success(
            cerrando ? 'Observación cerrada' : 'Observación reabierta',
            cerrando
              ? 'La observación quedó cerrada.'
              : `Se creó una observación nueva en la revisión de la versión ${siguiente}.`,
          );
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            cerrando ? 'No se pudo cerrar la observación' : 'No se pudo reabrir la observación',
            mensajeDeErrorCambiarEstadoObservacion(err),
          );
          onCerrar();
          if (
            decisionObservacionYaNoAplica(err) &&
            (hasApiErrorCode(err, ARTEFACTO_OMITIDO) ||
              hasApiErrorCode(err, ARTEFACTO_ASESOR_NO_PROPIETARIO))
          ) {
            onSalir?.();
          }
        },
      },
    );
  }

  return (
    <ConfirmDialog
      variante="advertencia"
      titulo={cerrando ? '¿Cerrar observación?' : '¿Reabrir observación?'}
      descripcion={`Vas a ${cerrando ? 'cerrar' : 'reabrir'} la observación «${observacion.descripcion}».`}
      consecuencias={
        cerrando
          ? [
              'La observación queda cerrada y ya no se puede reabrir.',
              'No se envía correo a los estudiantes.',
            ]
          : [
              `Se crea una observación nueva con la misma descripción en la revisión de la versión ${siguiente}.`,
              'Se envía un correo a los estudiantes vinculados al artefacto.',
              `La revisión de la versión ${siguiente} debe seguir pendiente.`,
            ]
      }
      labelConfirmar={cerrando ? 'Cerrar observación' : 'Reabrir observación'}
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
