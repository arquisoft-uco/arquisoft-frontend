import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRemoverObservacionEvaluacion } from '../../hooks/useRemoverObservacionEvaluacion';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';

const CONSECUENCIAS = [
  'La observación dejará de aparecer en esta evaluación.',
  'Podrás volver a agregar el mismo texto.',
  'No se puede deshacer.',
];

interface Props {
  observacion: ObservacionEvaluacion;
  fichaPerfilId: string;
  evaluacionId: string;
  onCerrar: () => void;
}

export default function EliminarObservacionEvaluacionDialogo({
  observacion,
  fichaPerfilId,
  evaluacionId,
  onCerrar,
}: Props) {
  const remover = useRemoverObservacionEvaluacion(fichaPerfilId, evaluacionId);

  function handleConfirmar() {
    remover.mutate(observacion.id, {
      onSuccess: () => {
        toast.success('Observación eliminada', 'La observación se quitó de la evaluación.');
        onCerrar();
      },
      onError: (err) => {
        toast.error(
          'No se pudo eliminar la observación',
          getApiErrorMessage(err, 'Inténtalo nuevamente.'),
        );
        onCerrar();
      },
    });
  }

  function handleCancelar() {
    if (remover.isPending) return;
    onCerrar();
  }

  return (
    <ConfirmDialog
      variante="peligro"
      titulo="¿Eliminar observación?"
      descripcion={`«${observacion.observacion}»`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Eliminar"
      cargando={remover.isPending}
      onConfirmar={handleConfirmar}
      onCancelar={handleCancelar}
    />
  );
}
