import Button from '../../../../shared/components/ui/Button';
import { useTarea } from '../../hooks/useTarea';
import type { PlanEstimadoProyecto } from '../../models/PlanEstimadoProyecto';
import { puedeGestionarPlanEstimado } from '../../utils/estados-tarea';

interface Props {
  plan: PlanEstimadoProyecto;
  onAportar: (plan: PlanEstimadoProyecto) => void;
}

export default function AportarPlanEstimadoAccion({ plan, onAportar }: Props) {
  const { tarea, cargando } = useTarea(plan.tareaId);

  if (cargando || (tarea && !puedeGestionarPlanEstimado(tarea.estado.id))) return null;

  return (
    <Button
      variante="secundario"
      tamano="sm"
      aria-label={`Aportar al plan de ${plan.descripcionTarea}`}
      onClick={() => onAportar(plan)}
    >
      Aportar
    </Button>
  );
}
