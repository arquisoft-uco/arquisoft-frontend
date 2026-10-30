import { GraduationCap } from 'lucide-react';
import SelectorProyectoGrado from '../../../shared/components/SelectorProyectoGrado';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';
import ConsultarEntregablesEstudiante from './estudiante/ConsultarEntregablesEstudiante';

const RAIZ = 'flex flex-col gap-6';

export default function EstudianteView() {
  const { proyecto, proyectos, seleccionarProyecto, cargado, sinProyecto, hayError, reintentar } =
    useMisProyectosGrado();

  if (hayError) {
    return (
      <ErrorState
        titulo="No pudimos cargar tu proyecto de grado"
        descripcion="Inténtalo nuevamente."
        onReintentar={reintentar}
      />
    );
  }

  if (!cargado) return <Skeleton variante="tabla" etiqueta="Cargando tus entregables…" />;

  if (sinProyecto || !proyecto) {
    return (
      <EmptyState
        icono={GraduationCap}
        titulo="Aún no perteneces a un proyecto de grado"
        descripcion="Cuando tu coordinador te asigne a uno, aparecerá aquí."
      />
    );
  }

  return (
    <div className={RAIZ}>
      {proyectos.length > 1 && (
        <SelectorProyectoGrado
          proyectos={proyectos}
          proyectoActivoId={proyecto.id}
          onSeleccionar={seleccionarProyecto}
        />
      )}
      <PageHeader
        titulo="Entregables"
        descripcion="Consulta los entregables de tu proyecto de grado: su versión, su asesor y su estado."
        meta={proyecto.tituloProyecto}
      />
      <ConsultarEntregablesEstudiante key={proyecto.id} proyectoGradoId={proyecto.id} />
    </div>
  );
}
