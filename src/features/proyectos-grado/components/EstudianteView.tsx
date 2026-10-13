import { useState, type ComponentType } from 'react';
import { GraduationCap } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import Tabs from '../../../shared/components/ui/Tabs';
import { useMisProyectosGrado } from '../hooks/useMisProyectosGrado';
import type { ProyectoGrado } from '../models/ProyectoGrado';
import type { ResumenProyectoGrado } from '../models/ResumenProyectoGrado';
import { InsigniaEstadoProyecto } from './coordinador/ProyectoGradoCeldas';
import { DISPOSICION } from './disposicion';
import HistorialEstadosProyectoPanel from './estudiante/HistorialEstadosProyectoPanel';
import SelectorProyectoGrado from './estudiante/SelectorProyectoGrado';
import ResumenProyectoGradoPanel from './ResumenProyectoGradoPanel';

const RAIZ = 'flex flex-col gap-6';

type Pestana = 'estados';

const PANEL_POR_PESTANA: Record<Pestana, ComponentType<{ proyectoGradoId: string }>> = {
  estados: HistorialEstadosProyectoPanel,
};

const PESTANAS = [{ id: 'estados' as const, etiqueta: 'Historial de estados' }];

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
  const [pestana, setPestana] = useState<Pestana>('estados');

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

  const Panel = PANEL_POR_PESTANA[pestana];

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
      <div className={DISPOSICION.contenedor}>
        <div className={DISPOSICION.principal}>
          <Tabs
            items={PESTANAS}
            valor={pestana}
            onCambiar={setPestana}
            etiqueta="Secciones de mi proyecto de grado"
          >
            <Panel key={proyecto.id} proyectoGradoId={proyecto.id} />
          </Tabs>
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenProyectoGradoPanel resumen={aResumen(proyecto)} />
        </div>
      </div>
    </div>
  );
}
