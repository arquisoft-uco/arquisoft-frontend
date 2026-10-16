import { SearchX } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { useDetalleProyectoGradoAsesor } from '../hooks/useDetalleProyectoGradoAsesor';
import { useResumenProyectoGrado } from '../hooks/useResumenProyectoGrado';
import { aResumen } from '../utils/resumen-proyecto-grado';
import EstudiantesAsesoradosPanel from './asesor/EstudiantesAsesoradosPanel';
import { InsigniaEstadoProyecto } from './coordinador/ProyectoGradoCeldas';
import { DISPOSICION } from './disposicion';
import ResumenProyectoGradoPanel from './ResumenProyectoGradoPanel';

const RAIZ = 'flex flex-col gap-6';
const TITULO_GENERICO = 'Proyecto de grado';

export default function AsesorDetalleView() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { resumen, search } = useResumenProyectoGrado(id);
  const { data: proyecto, isLoading, error, refetch } = useDetalleProyectoGradoAsesor(id);

  if (!id) return <Navigate to="/proyectos-grado" replace />;

  const rutaListado = `/proyectos-grado${search}`;

  if (isLoading) {
    const provisional = resumen?.titulo ?? TITULO_GENERICO;
    return (
      <div className={RAIZ}>
        <PageHeader
          titulo={provisional}
          migas={[{ etiqueta: 'Proyectos de grado', to: rutaListado }, { etiqueta: provisional }]}
        />
        <div className={DISPOSICION.contenedor}>
          <div className={DISPOSICION.principal}>
            <Skeleton variante="tarjetas" etiqueta="Cargando los estudiantes que asesoras…" />
          </div>
          <div className={DISPOSICION.lateral}>
            <Skeleton variante="tarjetas" etiqueta="Cargando el resumen del proyecto…" />
          </div>
        </div>
      </div>
    );
  }

  if (isApiErrorWithStatus(error, 422)) {
    return (
      <EmptyState
        icono={SearchX}
        titulo="No encontramos este proyecto entre los que asesoras"
        descripcion="Puede que ya no tengas asignación vigente o que el proyecto no exista."
        accion={
          <Button variante="secundario" onClick={() => navigate(rutaListado)}>
            Volver a proyectos de grado
          </Button>
        }
      />
    );
  }

  if (error || !proyecto) {
    return (
      <ErrorState
        titulo="No pudimos cargar el proyecto de grado"
        descripcion="Inténtalo nuevamente."
        onReintentar={refetch}
      />
    );
  }

  const titulo = proyecto.tituloProyecto;

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo={titulo}
        migas={[{ etiqueta: 'Proyectos de grado', to: rutaListado }, { etiqueta: titulo }]}
        insignia={
          <InsigniaEstadoProyecto estadoId={proyecto.estado.id} nombre={proyecto.estado.nombre} />
        }
      />
      <div className={DISPOSICION.contenedor}>
        <div className={DISPOSICION.principal}>
          <EstudiantesAsesoradosPanel proyectoGradoId={proyecto.id} />
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenProyectoGradoPanel resumen={aResumen(proyecto)} />
        </div>
      </div>
    </div>
  );
}
