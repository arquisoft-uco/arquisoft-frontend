import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useRemoverJuradoEvaluacion } from '../../hooks/useRemoverJuradoEvaluacion';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';
import { mensajeErrorRemoverJurado } from '../../utils/errores-remover-jurado-evaluacion';

const CONSECUENCIAS = [
  'Dejará de estar asignado a esta evaluación.',
  'Si ya registró evaluaciones, no se podrá remover.',
  'Podrás asignarlo de nuevo después.',
];

interface Props {
  evaluacionId: string;
  jurado: EvaluacionJurado;
  retrocederPagina: boolean;
  onRetroceder: () => void;
  onCerrar: () => void;
}

export default function RemoverJuradoEvaluacionDialog({
  evaluacionId,
  jurado,
  retrocederPagina,
  onRetroceder,
  onCerrar,
}: Props) {
  const { mutate, isPending } = useRemoverJuradoEvaluacion(evaluacionId);
  const nombre = jurado.jurado.nombre;

  function handleConfirmar() {
    mutate(jurado.jurado.id, {
      onSuccess: () => {
        toast.success('Jurado removido', `${nombre} ya no está asignado a la evaluación.`);
        if (retrocederPagina) onRetroceder();
        onCerrar();
      },
      onError: (err) => {
        toast.error('No se pudo remover el jurado', mensajeErrorRemoverJurado(err, nombre));
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      variante="peligro"
      titulo="¿Remover jurado?"
      descripcion={`Vas a remover a ${nombre} de esta evaluación.`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Remover"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
