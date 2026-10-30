import { SearchX } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useContextoDetalleTarea } from '../hooks/useContextoDetalleTarea';
import { useTarea } from '../hooks/useTarea';
import TareaDetalleCard from './estudiante/TareaDetalleCard';

export default function DetalleTareaEstudianteView() {
  const { id: tareaId = '' } = useParams();
  const navigate = useNavigate();
  const { tarea, cargando, noEncontrada, hayError, reintentar } = useTarea(tareaId);
  const { search } = useContextoDetalleTarea();

  if (!tareaId) return <Navigate to="/mapas-ruta" replace />;

  const rutaListado = `/mapas-ruta${search}`;

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
    return tarea ? <TareaDetalleCard tarea={tarea} /> : null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        migas={[{ etiqueta: 'Mapas de ruta', to: rutaListado }, { etiqueta: 'Tarea' }]}
        titulo="Detalle de la tarea"
        descripcion="Consulta la información de esta tarea de tu mapa de ruta."
      />
      {contenido()}
    </div>
  );
}
