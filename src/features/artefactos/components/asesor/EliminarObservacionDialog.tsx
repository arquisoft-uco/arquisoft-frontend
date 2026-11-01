import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarObservacion } from '../../hooks/useEliminarObservacion';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import { mensajeDeErrorObservacion } from '../../utils/errores-observacion-revision';

const CONSECUENCIAS = [
  'Se elimina de forma definitiva: no se puede deshacer.',
  'No se notifica a los estudiantes.',
];

interface Props {
  observacion: ObservacionRevision;
  onCerrar: () => void;
}

export default function EliminarObservacionDialog({ observacion, onCerrar }: Props) {
  const { mutate, isPending } = useEliminarObservacion();

  function handleConfirmar() {
    mutate(
      { observacionId: observacion.id, revisionAsesorId: observacion.revisionAsesorId },
      {
        onSuccess: () => {
          toast.success('Observación eliminada');
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudo eliminar la observación',
            mensajeDeErrorObservacion(err, 'Inténtalo nuevamente.'),
          );
          onCerrar();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      variante="peligro"
      titulo="¿Eliminar observación?"
      descripcion={`Vas a eliminar la observación «${observacion.descripcion}».`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Eliminar observación"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
