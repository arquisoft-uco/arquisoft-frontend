import { ArrowRightLeft, CalendarClock, Pencil, SearchX, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useContextoDetalleTarea } from '../hooks/useContextoDetalleTarea';
import { usePlanEstimadoTarea } from '../hooks/usePlanEstimadoTarea';
import { usePlanRealTarea } from '../hooks/usePlanRealTarea';
import { useTarea } from '../hooks/useTarea';
import {
  destinosDeEstado,
  esTareaRemovible,
  puedeRemoverPlanEstimado,
} from '../utils/estados-tarea';
import type { PanelDetalleTarea } from './estudiante/PanelesDetalleTarea';
import PanelesDetalleTarea from './estudiante/PanelesDetalleTarea';
import PlanEstimadoTareaSeccion from './estudiante/PlanEstimadoTareaSeccion';
import PlanRealTareaSeccion from './estudiante/PlanRealTareaSeccion';
import TareaDetalleCard from './estudiante/TareaDetalleCard';

export default function DetalleTareaEstudianteView() {
  const { id: tareaId = '' } = useParams();
  const navigate = useNavigate();
  const { tarea, cargando, noEncontrada, hayError, reintentar } = useTarea(tareaId);
  const planEstimado = usePlanEstimadoTarea(tareaId, !!tarea);
  const planReal = usePlanRealTarea(tareaId, !!tarea);
  const { search } = useContextoDetalleTarea();
  const [panelAbierto, setPanelAbierto] = useState<PanelDetalleTarea | null>(null);

  if (!tareaId) return <Navigate to="/mapas-ruta" replace />;

  const rutaListado = `/mapas-ruta${search}`;
  const puedeCambiarEstado = !!tarea && destinosDeEstado(tarea.estado.id).length > 0;

  function contenido() {
    if (cargando) return <Skeleton variante="lineas" etiqueta="Cargando la tarea…" />;
    if (noEncontrada) {
      return (
        <EmptyState
          icono={SearchX}
          titulo="No encontramos esta tarea"
          descripcion="Puede que ya no exista o que el enlace no sea correcto."
          accion={
            <Button variante="secundario" onClick={() => navigate(rutaListado)}>
              Volver a mis tareas
            </Button>
          }
        />
      );
    }
    if (hayError) {
      return <ErrorState titulo="No pudimos cargar la tarea" onReintentar={() => reintentar()} />;
    }
    if (!tarea) return null;
    return (
      <>
        <TareaDetalleCard tarea={tarea} />
        <PlanEstimadoTareaSeccion
          consulta={planEstimado}
          onAgregar={() => setPanelAbierto('plan')}
          onEditar={() => setPanelAbierto('modificarPlan')}
          puedeEliminar={puedeRemoverPlanEstimado(tarea.estado.id)}
          onEliminar={() => setPanelAbierto('eliminarPlan')}
        />
        <PlanRealTareaSeccion
          consulta={planReal}
          onEditar={() => setPanelAbierto('modificarPlanReal')}
          onRemover={() => setPanelAbierto('eliminarPlanReal')}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        migas={[{ etiqueta: 'Mapas de ruta', to: rutaListado }, { etiqueta: 'Tarea' }]}
        titulo="Detalle de la tarea"
        descripcion="Consulta la información de esta tarea de tu mapa de ruta."
        acciones={
          tarea ? (
            <>
              {puedeCambiarEstado && (
                <Button icono={ArrowRightLeft} onClick={() => setPanelAbierto('estado')}>
                  Cambiar estado
                </Button>
              )}
              {planEstimado.puedeAgregar && (
                <Button
                  variante="secundario"
                  icono={CalendarClock}
                  onClick={() => setPanelAbierto('plan')}
                >
                  Agregar plan estimado
                </Button>
              )}
              <Button
                variante="secundario"
                icono={Pencil}
                onClick={() => setPanelAbierto('informacion')}
              >
                Editar tarea
              </Button>
              {esTareaRemovible(tarea.estado.id) && (
                <Button
                  variante="peligroContorno"
                  icono={Trash2}
                  onClick={() => setPanelAbierto('eliminar')}
                >
                  Eliminar tarea
                </Button>
              )}
            </>
          ) : undefined
        }
      />
      {contenido()}
      <PanelesDetalleTarea
        panelAbierto={panelAbierto}
        tarea={tarea}
        plan={planEstimado.plan}
        planReal={planReal.plan}
        onCerrar={() => setPanelAbierto(null)}
        onTareaEliminada={() => navigate(rutaListado, { replace: true })}
      />
    </div>
  );
}
