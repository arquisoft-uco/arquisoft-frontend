import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarPlanReal } from '../../hooks/useEliminarPlanReal';
import type { PlanReal } from '../../models/PlanReal';
import type { Tarea } from '../../models/Tarea';
import { mensajeErrorEliminarPlanReal } from '../../utils/errores-mapa-ruta';

const CONSECUENCIAS = [
  'Se elimina de forma definitiva: no se puede deshacer.',
  'El plan estimado y la tarea no cambian.',
  'Si la tarea vuelve a finalizarse, el sistema puede recalcular un plan real nuevo.',
];

interface Props {
  tarea: Tarea;
  plan: PlanReal;
  onCerrar: () => void;
}

export default function EliminarPlanRealDialog({ tarea, plan, onCerrar }: Props) {
  const mutacion = useEliminarPlanReal();

  function confirmar() {
    mutacion.mutate(
      { planRealId: plan.id, tareaId: tarea.id },
      {
        onSuccess: () => {
          toast.success('Plan real removido');
          onCerrar();
        },
        onError: (err) => {
          toast.error('No se pudo remover el plan real', mensajeErrorEliminarPlanReal(err));
          onCerrar();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      titulo={`¿Remover el plan real de la tarea «${tarea.descripcion}»?`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Remover plan real"
      variante="peligro"
      cargando={mutacion.isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
