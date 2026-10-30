import type { ComponentType } from 'react';
import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarArtefactosEstudiante from './estudiante/ConsultarArtefactosEstudiante';
import ConsultarParticipacionesEstudiante from './estudiante/ConsultarParticipacionesEstudiante';
import ConsultarVersionesArtefactoEstudiante from './estudiante/ConsultarVersionesArtefactoEstudiante';

type Vista = 'mis-artefactos' | 'participacion' | 'versiones-artefactos';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  'mis-artefactos': ConsultarArtefactosEstudiante,
  participacion: ConsultarParticipacionesEstudiante,
  'versiones-artefactos': ConsultarVersionesArtefactoEstudiante,
};

const DESCRIPCION_POR_VISTA: Record<Vista, string> = {
  'mis-artefactos':
    'Todos los artefactos de los proyectos de grado a los que perteneces, aunque no estés asignado a cada uno.',
  participacion:
    'Solo los artefactos en los que estás asignado directamente, agrupados por proyecto de grado.',
  'versiones-artefactos':
    'El historial de versiones subidas a los artefactos en los que estás asignado, con su número y fecha de creación.',
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
        descripcion="Consulta los artefactos de tus proyectos de grado, revisa en cuáles participas y sigue las versiones de cada uno."
      />
      <Tabs
        etiqueta="Secciones de artefactos"
        valor={vista}
        items={[
          { id: 'mis-artefactos', etiqueta: 'Mis artefactos', to: pathname },
          {
            id: 'participacion',
            etiqueta: 'Participación',
            to: `${pathname}?vista=participacion`,
          },
          {
            id: 'versiones-artefactos',
            etiqueta: 'Versiones de artefactos',
            to: `${pathname}?vista=versiones-artefactos`,
          },
        ]}
      />
      <p className="text-sm text-on-surface-secondary">{DESCRIPCION_POR_VISTA[vista]}</p>
      <Contenido />
    </div>
  );
}
