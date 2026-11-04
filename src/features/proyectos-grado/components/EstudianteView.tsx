import { useState, type ComponentType } from 'react';
import { GraduationCap } from 'lucide-react';
import SelectorProyectoGrado from '../../../shared/components/SelectorProyectoGrado';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import Tabs from '../../../shared/components/ui/Tabs';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';
import { aResumen } from '../utils/resumen-proyecto-grado';
import { InsigniaEstadoProyecto } from './coordinador/ProyectoGradoCeldas';
import { DISPOSICION } from './disposicion';
import AsesorActualResumen from './estudiante/AsesorActualResumen';
import CompanerosProyectoResumen from './estudiante/CompanerosProyectoResumen';
import HistorialAsesoresProyectoPanel from './estudiante/HistorialAsesoresProyectoPanel';
import HistorialEstadosProyectoPanel from './estudiante/HistorialEstadosProyectoPanel';
import ResumenProyectoGradoPanel from './ResumenProyectoGradoPanel';

const RAIZ = 'flex flex-col gap-6';

type Pestana = 'estados' | 'asesores';

const PANEL_POR_PESTANA: Record<Pestana, ComponentType<{ proyectoGradoId: string }>> = {
  estados: HistorialEstadosProyectoPanel,
  asesores: HistorialAsesoresProyectoPanel,
};

const PESTANAS = [
  { id: 'estados' as const, etiqueta: 'Historial de estados' },
  { id: 'asesores' as const, etiqueta: 'Historial de asesores' },
];

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
          <ResumenProyectoGradoPanel
            resumen={aResumen(proyecto)}
            asesor={<AsesorActualResumen key={proyecto.id} proyectoGradoId={proyecto.id} />}
            estudiantes={
              <CompanerosProyectoResumen key={proyecto.id} proyectoGradoId={proyecto.id} />
            }
          />
        </div>
      </div>
    </div>
  );
}
