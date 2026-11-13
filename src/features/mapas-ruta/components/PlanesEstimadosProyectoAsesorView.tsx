import { Map } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useContextoDetalleTarea } from '../hooks/useContextoDetalleTarea';
import { useMapaRutaProyectoAsesor } from '../hooks/useMapaRutaProyectoAsesor';
import ConsultarPlanesEstimadosProyecto from './asesor/ConsultarPlanesEstimadosProyecto';

export default function PlanesEstimadosProyectoAsesorView() {
  const { proyectoGradoId = '' } = useParams();
  const navigate = useNavigate();
  const { mapa, cargando, sinMapa, hayError, reintentar } =
    useMapaRutaProyectoAsesor(proyectoGradoId);
  const { search } = useContextoDetalleTarea();

  if (!proyectoGradoId) return <Navigate to="/mapas-ruta" replace />;

  const rutaListado = `/mapas-ruta${search}`;

  function contenido() {
    if (cargando) return <Skeleton variante="lineas" etiqueta="Cargando el mapa de ruta…" />;
    if (sinMapa) {
      return (
        <EmptyState
          icono={Map}
          titulo="Aún no hay mapa de ruta"
          descripcion="Cuando el coordinador defina el mapa de este proyecto, aquí verás los planes estimados de sus tareas."
          accion={
            <Button variante="secundario" onClick={() => navigate(rutaListado)}>
              Volver a mapas de ruta
            </Button>
          }
        />
      );
    }
    if (hayError) {
      return (
        <ErrorState titulo="No pudimos cargar el mapa de ruta" onReintentar={() => reintentar()} />
      );
    }
    if (!mapa) return null;
    return <ConsultarPlanesEstimadosProyecto proyectoGradoId={proyectoGradoId} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        migas={[
          { etiqueta: 'Mapas de ruta', to: rutaListado },
          { etiqueta: mapa?.titulo ?? 'Planes estimados' },
        ]}
        titulo="Planes estimados del proyecto"
        descripcion={
          mapa?.titulo ?? 'Consulta los planes estimados de las tareas de un proyecto que asesoras.'
        }
      />
      {contenido()}
    </div>
  );
}
