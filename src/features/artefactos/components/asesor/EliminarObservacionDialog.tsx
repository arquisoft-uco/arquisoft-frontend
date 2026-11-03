import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarObservacion } from '../../hooks/useEliminarObservacion';
import { mensajeErrorEliminarObservacion } from '../../utils/errores-eliminar-observacion';

interface Props {
  observacionId: string;
  onCerrar: () => void;
}

export default function EliminarObservacionDialog({ observacionId, onCerrar }: Props) {
  const eliminar = useEliminarObservacion();

  function confirmarEliminacion() {
    eliminar.mutate(observacionId, {
      onSuccess: () => {
        toast.success('Observación eliminada');
        onCerrar();
      },
      onError: (err) => {
        toast.error(
          'No se pudo eliminar la observación',
          mensajeErrorEliminarObservacion(err, 'No se pudo eliminar la observación.'),
        );
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      titulo="¿Eliminar esta observación?"
      descripcion="La observación dejará de aparecer en la revisión."
      consecuencias={['Se borra de forma definitiva: no se puede deshacer.']}
      labelConfirmar="Eliminar observación"
      variante="peligro"
      cargando={eliminar.isPending}
      onConfirmar={confirmarEliminacion}
      onCancelar={onCerrar}
    />
  );
}
