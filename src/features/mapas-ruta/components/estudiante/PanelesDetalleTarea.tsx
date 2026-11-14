import type { PlanEstimado } from '../../models/PlanEstimado';
import type { PlanReal } from '../../models/PlanReal';
import type { Tarea } from '../../models/Tarea';
import AgregarPlanEstimadoPanel from './AgregarPlanEstimadoPanel';
import CambiarEstadoTareaPanel from './CambiarEstadoTareaPanel';
import EliminarPlanEstimadoDialog from './EliminarPlanEstimadoDialog';
import EliminarPlanRealDialog from './EliminarPlanRealDialog';
import EliminarTareaDialog from './EliminarTareaDialog';
import ModificarInformacionTareaPanel from './ModificarInformacionTareaPanel';
import ModificarPlanEstimadoPanel from './ModificarPlanEstimadoPanel';
import ModificarPlanRealPanel from './ModificarPlanRealPanel';

export type PanelDetalleTarea =
  | 'estado'
  | 'plan'
  | 'modificarPlan'
  | 'eliminarPlan'
  | 'modificarPlanReal'
  | 'eliminarPlanReal'
  | 'informacion'
  | 'eliminar';

interface Props {
  panelAbierto: PanelDetalleTarea | null;
  tarea: Tarea | undefined;
  plan: PlanEstimado | undefined;
  planReal: PlanReal | undefined;
  onCerrar: () => void;
  onTareaEliminada: () => void;
}

export default function PanelesDetalleTarea({
  panelAbierto,
  tarea,
  plan,
  planReal,
  onCerrar,
  onTareaEliminada,
}: Props) {
  if (!tarea) return null;

  return (
    <>
      {panelAbierto === 'estado' && <CambiarEstadoTareaPanel tarea={tarea} onCerrar={onCerrar} />}
      {panelAbierto === 'plan' && <AgregarPlanEstimadoPanel tarea={tarea} onCerrar={onCerrar} />}
      {panelAbierto === 'modificarPlan' && plan && (
        <ModificarPlanEstimadoPanel tarea={tarea} plan={plan} onCerrar={onCerrar} />
      )}
      {panelAbierto === 'eliminarPlan' && plan && (
        <EliminarPlanEstimadoDialog tarea={tarea} plan={plan} onCerrar={onCerrar} />
      )}
      {panelAbierto === 'modificarPlanReal' && planReal && (
        <ModificarPlanRealPanel tarea={tarea} plan={planReal} onCerrar={onCerrar} />
      )}
      {panelAbierto === 'eliminarPlanReal' && planReal && (
        <EliminarPlanRealDialog tarea={tarea} plan={planReal} onCerrar={onCerrar} />
      )}
      {panelAbierto === 'informacion' && (
        <ModificarInformacionTareaPanel tarea={tarea} onCerrar={onCerrar} />
      )}
      {panelAbierto === 'eliminar' && (
        <EliminarTareaDialog tarea={tarea} onCerrar={onCerrar} onEliminada={onTareaEliminada} />
      )}
    </>
  );
}
