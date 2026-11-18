import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRemoverObservacionItemAsesor } from '../../hooks/useRemoverObservacionItemAsesor';
import type { ObservacionItemAsesor } from '../../models/ObservacionItemAsesor';

const CONSECUENCIAS = [
  'Dejará de aparecer en las observaciones del ítem.',
  'No se puede deshacer.',
];

interface Props {
  observacion: ObservacionItemAsesor;
  nombreItem: string;
  onRemovida: () => void;
  onCerrar: () => void;
}

export default function RemoverObservacionItemAsesorDialog({
  observacion,
  nombreItem,
  onRemovida,
  onCerrar,
}: Props) {
  const { mutate, isPending } = useRemoverObservacionItemAsesor();

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
          getApiErrorMessage(err, 'No se pudo remover la observación.'),
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
