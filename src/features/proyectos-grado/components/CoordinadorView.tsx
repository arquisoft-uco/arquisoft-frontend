import type { ComponentType } from 'react';
import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarEstadosAsesorProyectoGrado from './coordinador/ConsultarEstadosAsesorProyectoGrado';
import ConsultarProyectosGradoCoordinador from './coordinador/ConsultarProyectosGradoCoordinador';

type Vista = 'proyectos' | 'estados-asesor';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  proyectos: ConsultarProyectosGradoCoordinador,
  'estados-asesor': ConsultarEstadosAsesorProyectoGrado,
};

function leerVista(valor: string): Vista {
  return Object.keys(CONTENIDO_POR_VISTA).includes(valor) ? (valor as Vista) : 'proyectos';
}

export default function CoordinadorView() {
  const { pathname } = useLocation();
  const vista = leerVista(useParametrosListado().texto('vista'));
  const Contenido = CONTENIDO_POR_VISTA[vista];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Proyectos de grado"
        descripcion="Consulta los proyectos de grado que tienes a tu cargo y los estados posibles de sus asesores."
      />
      <Tabs
        etiqueta="Secciones de proyectos de grado"
        valor={vista}
        items={[
          { id: 'proyectos', etiqueta: 'Proyectos de grado', to: pathname },
          {
            id: 'estados-asesor',
            etiqueta: 'Estados de asesor',
            to: `${pathname}?vista=estados-asesor`,
          },
        ]}
      />
      <Contenido />
    </div>
  );
}
