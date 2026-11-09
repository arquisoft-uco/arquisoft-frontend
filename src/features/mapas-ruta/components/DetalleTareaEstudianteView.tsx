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
import { useTarea } from '../hooks/useTarea';
import { destinosDeEstado, esTareaRemovible } from '../utils/estados-tarea';
import AgregarPlanEstimadoPanel from './estudiante/AgregarPlanEstimadoPanel';
import CambiarEstadoTareaPanel from './estudiante/CambiarEstadoTareaPanel';
import EliminarTareaDialog from './estudiante/EliminarTareaDialog';
import ModificarInformacionTareaPanel from './estudiante/ModificarInformacionTareaPanel';
import PlanEstimadoTareaSeccion from './estudiante/PlanEstimadoTareaSeccion';
import TareaDetalleCard from './estudiante/TareaDetalleCard';

export default function DetalleTareaEstudianteView() {
  const { id: tareaId = '' } = useParams();
  const navigate = useNavigate();
  const { tarea, cargando, noEncontrada, hayError, reintentar } = useTarea(tareaId);
  const planEstimado = usePlanEstimadoTarea(tareaId, !!tarea);
  const { search } = useContextoDetalleTarea();
  const [panelAbierto, setPanelAbierto] = useState<
    'estado' | 'plan' | 'informacion' | 'eliminar' | null
  >(null);

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
      {panelAbierto === 'estado' && tarea && (
        <CambiarEstadoTareaPanel tarea={tarea} onCerrar={() => setPanelAbierto(null)} />
      )}
      {panelAbierto === 'plan' && tarea && (
        <AgregarPlanEstimadoPanel tarea={tarea} onCerrar={() => setPanelAbierto(null)} />
      )}
      {panelAbierto === 'informacion' && tarea && (
        <ModificarInformacionTareaPanel tarea={tarea} onCerrar={() => setPanelAbierto(null)} />
      )}
      {panelAbierto === 'eliminar' && tarea && (
        <EliminarTareaDialog
          tarea={tarea}
          onCerrar={() => setPanelAbierto(null)}
          onEliminada={() => navigate(rutaListado, { replace: true })}
        />
      )}
    </div>
  );
}
