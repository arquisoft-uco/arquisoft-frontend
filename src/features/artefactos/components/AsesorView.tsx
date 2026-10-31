import type { ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarArtefactosAsignadosAsesor from './asesor/ConsultarArtefactosAsignadosAsesor';
import ConsultarVersionesArtefactoAsesor from './asesor/ConsultarVersionesArtefactoAsesor';
import ConsultarVersionesRepositorioAsesor from './asesor/ConsultarVersionesRepositorioAsesor';

type Vista = 'artefactos' | 'versiones-artefactos' | 'versiones';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  artefactos: ConsultarArtefactosAsignadosAsesor,
  'versiones-artefactos': ConsultarVersionesArtefactoAsesor,
  versiones: ConsultarVersionesRepositorioAsesor,
};

const VISTAS_RETIRADAS: Record<string, Vista> = {
  revisiones: 'versiones-artefactos',
  estados: 'versiones-artefactos',
};

function leerVista(valor: string): Vista {
  return Object.keys(CONTENIDO_POR_VISTA).includes(valor) ? (valor as Vista) : 'artefactos';
}

export default function AsesorView() {
  const { pathname } = useLocation();
  const valorVista = useParametrosListado().texto('vista');
  const vista = leerVista(valorVista);
  const Contenido = CONTENIDO_POR_VISTA[vista];

  if (Object.keys(VISTAS_RETIRADAS).includes(valorVista)) {
    return <Navigate to={`${pathname}?vista=${VISTAS_RETIRADAS[valorVista]}`} replace />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Artefactos"
        descripcion="Consulta los artefactos que tienes asignados, el estado de revisión de sus versiones y las versiones de repositorio disponibles para asignar."
      />
      <Tabs
        etiqueta="Secciones de artefactos"
        valor={vista}
        items={[
          { id: 'artefactos', etiqueta: 'Artefactos asignados', to: pathname },
          {
            id: 'versiones-artefactos',
            etiqueta: 'Versiones de artefactos',
            to: `${pathname}?vista=versiones-artefactos`,
          },
          {
            id: 'versiones',
            etiqueta: 'Versiones de repositorio',
            to: `${pathname}?vista=versiones`,
          },
        ]}
      />
      <Contenido />
    </div>
  );
}
