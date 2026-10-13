import { GraduationCap } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useMisProyectosGrado } from '../hooks/useMisProyectosGrado';
import type { ProyectoGrado } from '../models/ProyectoGrado';
import type { ResumenProyectoGrado } from '../models/ResumenProyectoGrado';
import { InsigniaEstadoProyecto } from './coordinador/ProyectoGradoCeldas';
import SelectorProyectoGrado from './estudiante/SelectorProyectoGrado';
import ResumenProyectoGradoPanel from './ResumenProyectoGradoPanel';

const RAIZ = 'flex flex-col gap-6';
const CONTENEDOR_RESUMEN = 'w-full max-w-md';

function aResumen(proyecto: ProyectoGrado): ResumenProyectoGrado {
  return {
    id: proyecto.id,
    titulo: proyecto.tituloProyecto,
    estadoId: proyecto.estado.id,
    estadoNombre: proyecto.estado.nombre,
  };
}

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

  if (!cargado) return <Skeleton variante="tarjetas" etiqueta="Cargando tu proyecto de grado…" />;

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
        titulo={proyecto.tituloProyecto}
        insignia={
          <InsigniaEstadoProyecto estadoId={proyecto.estado.id} nombre={proyecto.estado.nombre} />
        }
        meta="Mi proyecto de grado"
      />
      <div className={CONTENEDOR_RESUMEN}>
        <ResumenProyectoGradoPanel resumen={aResumen(proyecto)} />
      </div>
    </div>
  );
}
