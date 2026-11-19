import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarPlanEstimado } from '../../hooks/useEliminarPlanEstimado';
import type { PlanEstimado } from '../../models/PlanEstimado';
import type { Tarea } from '../../models/Tarea';
import { mensajeErrorEliminarPlanEstimado } from '../../utils/errores-mapa-ruta';

const CONSECUENCIAS = [
  'Se elimina de forma definitiva: no se puede deshacer.',
  'Podrás agregar un plan estimado nuevo a esta tarea.',
];

interface Props {
  tarea: Tarea;
  plan: PlanEstimado;
  onCerrar: () => void;
}

export default function EliminarPlanEstimadoDialog({ tarea, plan, onCerrar }: Props) {
  const mutacion = useEliminarPlanEstimado();

  function confirmar() {
    mutacion.mutate(
      { planEstimadoId: plan.id, tareaId: tarea.id },
      {
        onSuccess: () => {
          toast.success('Plan estimado removido');
          onCerrar();
        },
        onError: (err) => {
          toast.error('No se pudo remover el plan estimado', mensajeErrorEliminarPlanEstimado(err));
          onCerrar();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      titulo={`¿Remover el plan estimado de la tarea «${tarea.descripcion}»?`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Remover plan estimado"
      variante="peligro"
      cargando={mutacion.isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
