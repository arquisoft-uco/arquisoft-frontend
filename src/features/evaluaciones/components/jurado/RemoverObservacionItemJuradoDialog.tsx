import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useRemoverObservacionItemJurado } from '../../hooks/useRemoverObservacionItemJurado';
import type { ObservacionItemJurado } from '../../models/ObservacionItemJurado';
import { mensajeErrorRemoverObservacionItemJurado } from '../../utils/errores-remover-observacion-item-jurado';

const CONSECUENCIAS = [
  'Dejará de aparecer en las observaciones del ítem.',
  'No se puede deshacer.',
];

interface Props {
  observacion: ObservacionItemJurado;
  nombreItem: string;
  onRemovida: () => void;
  onCerrar: () => void;
}

export default function RemoverObservacionItemJuradoDialog({
  observacion,
  nombreItem,
  onRemovida,
  onCerrar,
}: Props) {
  const { mutate, isPending } = useRemoverObservacionItemJurado();

  function handleConfirmar() {
    mutate(observacion.id, {
      onSuccess: () => {
        toast.success('Observación removida', 'La observación se removió correctamente.');
        onRemovida();
        onCerrar();
      },
      onError: (err) => {
        toast.error(
          'No se pudo remover la observación',
          mensajeErrorRemoverObservacionItemJurado(err),
        );
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      variante="peligro"
      titulo="¿Remover observación?"
      descripcion={`Vas a remover una observación del ítem «${nombreItem}».`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Remover observación"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
