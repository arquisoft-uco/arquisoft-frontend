import type { ComponentType } from 'react';
import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarArtefactosEstudiante from './estudiante/ConsultarArtefactosEstudiante';
import ConsultarParticipacionesEstudiante from './estudiante/ConsultarParticipacionesEstudiante';
import ConsultarVersionesArtefactoEstudiante from './estudiante/ConsultarVersionesArtefactoEstudiante';

type Vista = 'artefactos-proyecto' | 'mis-artefactos' | 'versiones-artefactos';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  'artefactos-proyecto': ConsultarArtefactosEstudiante,
  'mis-artefactos': ConsultarParticipacionesEstudiante,
  'versiones-artefactos': ConsultarVersionesArtefactoEstudiante,
};

const DESCRIPCION_POR_VISTA: Record<Vista, string> = {
  'artefactos-proyecto':
    'Todos los artefactos de los proyectos de grado a los que perteneces, aunque no estés asignado a cada uno.',
  'mis-artefactos':
    'Los artefactos en los que estás asignado, agrupados por proyecto de grado. Elige uno para subir una nueva versión.',
  'versiones-artefactos':
    'El historial de versiones subidas a los artefactos en los que estás asignado, con su proyecto, documento, repositorio, asesor, estado de la revisión y fecha de creación.',
};

function leerVista(valor: string): Vista {
  return Object.keys(CONTENIDO_POR_VISTA).includes(valor)
    ? (valor as Vista)
    : 'artefactos-proyecto';
}

export default function EstudianteView() {
  const { pathname } = useLocation();
  const vista = leerVista(useParametrosListado().texto('vista'));
  const Contenido = CONTENIDO_POR_VISTA[vista];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Artefactos"
        descripcion="Consulta los artefactos de tus proyectos de grado, sube nuevas versiones de los tuyos y sigue las versiones de cada uno."
      />
      <Tabs
        etiqueta="Secciones de artefactos"
        valor={vista}
        items={[
          { id: 'artefactos-proyecto', etiqueta: 'Artefactos proyecto', to: pathname },
          {
            id: 'mis-artefactos',
            etiqueta: 'Mis artefactos',
            to: `${pathname}?vista=mis-artefactos`,
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
