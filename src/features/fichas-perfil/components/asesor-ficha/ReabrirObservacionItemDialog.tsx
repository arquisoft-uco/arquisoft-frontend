import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useReabrirObservacionItem } from '../../hooks/useReabrirObservacionItem';
import { mensajeErrorObservacionItem } from '../../utils/errores-observacion-item';

interface Props {
  observacionId: string;
  fichaPerfilId: string;
  onCerrar: () => void;
}

export default function ReabrirObservacionItemDialog({
  observacionId,
  fichaPerfilId,
  onCerrar,
}: Props) {
  const reabrir = useReabrirObservacionItem(fichaPerfilId);

  function confirmar() {
    reabrir.mutate(observacionId, {
      onSuccess: () => {
        toast.success('Observación reabierta');
        onCerrar();
      },
      onError: (err) => {
        toast.error(
          'No se pudo reabrir la observación',
          mensajeErrorObservacionItem(err, 'No se pudo reabrir la observación.'),
        );
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      titulo="¿Reabrir esta observación?"
      consecuencias={[
        'La observación vuelve a estar en progreso para que el estudiante la corrija.',
        'Si la revisión tenía las correcciones enviadas, también vuelve a estar en progreso y se avisa por correo a los estudiantes de la ficha.',
      ]}
      labelConfirmar="Reabrir observación"
      variante="advertencia"
      cargando={reabrir.isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
