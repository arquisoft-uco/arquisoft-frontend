import type { ComponentType } from 'react';
import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarArtefactosEstudiante from './estudiante/ConsultarArtefactosEstudiante';
import MisArtefactosEstudiante from './estudiante/MisArtefactosEstudiante';

type Vista = 'mis-artefactos' | 'artefactos-proyecto';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  'mis-artefactos': MisArtefactosEstudiante,
  'artefactos-proyecto': ConsultarArtefactosEstudiante,
};

const DESCRIPCION_POR_VISTA: Record<Vista, string> = {
  'mis-artefactos':
    'Tus artefactos con sus acciones, y debajo el historial de versiones con el estado de su revisión.',
  'artefactos-proyecto':
    'Todos los artefactos de los proyectos de grado a los que perteneces, aunque no estés asignado a cada uno.',
};

function leerVista(valor: string): Vista {
  return Object.keys(CONTENIDO_POR_VISTA).includes(valor) ? (valor as Vista) : 'mis-artefactos';
}

export default function EstudianteView() {
  const { pathname } = useLocation();
  const vista = leerVista(useParametrosListado().texto('vista'));
  const Contenido = CONTENIDO_POR_VISTA[vista];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Artefactos"
        descripcion="Consulta los artefactos de tus proyectos de grado, gestiona la revisión de los tuyos y sube nuevas versiones."
      />
      <Tabs
        etiqueta="Secciones de artefactos"
        valor={vista}
        items={[
          { id: 'mis-artefactos', etiqueta: 'Mis artefactos', to: pathname },
          {
            id: 'artefactos-proyecto',
            etiqueta: 'Artefactos proyecto',
            to: `${pathname}?vista=artefactos-proyecto`,
          },
        ]}
      />
      <p className="text-sm text-on-surface-secondary">{DESCRIPCION_POR_VISTA[vista]}</p>
      <Contenido />
    </div>
  );
}
