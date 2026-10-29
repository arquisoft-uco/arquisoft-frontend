import type { ComponentType } from 'react';
import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarArtefactosEstudiante from './estudiante/ConsultarArtefactosEstudiante';
import ConsultarParticipacionesEstudiante from './estudiante/ConsultarParticipacionesEstudiante';

type Vista = 'mis-artefactos' | 'participacion';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  'mis-artefactos': ConsultarArtefactosEstudiante,
  participacion: ConsultarParticipacionesEstudiante,
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
        descripcion="Consulta los artefactos de tus proyectos de grado y revisa en cuáles participas."
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
        ]}
      />
      <Contenido />
    </div>
  );
}
