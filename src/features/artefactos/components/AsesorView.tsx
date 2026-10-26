import type { ComponentType } from 'react';
import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarEstadosRevisionAsesor from './asesor/ConsultarEstadosRevisionAsesor';
import ConsultarRevisionesRealizadas from './asesor/ConsultarRevisionesRealizadas';
import ConsultarVersionesRepositorioAsesor from './asesor/ConsultarVersionesRepositorioAsesor';

type Vista = 'revisiones' | 'estados' | 'versiones';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  revisiones: ConsultarRevisionesRealizadas,
  estados: ConsultarEstadosRevisionAsesor,
  versiones: ConsultarVersionesRepositorioAsesor,
};

function leerVista(valor: string): Vista {
  return valor === 'estados' || valor === 'versiones' ? valor : 'revisiones';
}

export default function AsesorView() {
  const { pathname } = useLocation();
  const vista = leerVista(useParametrosListado().texto('vista'));
  const Contenido = CONTENIDO_POR_VISTA[vista];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Artefactos"
        descripcion="Consulta tus revisiones realizadas, sus estados y las versiones de repositorio disponibles para asignar."
      />
      <Tabs
        etiqueta="Secciones de artefactos"
        valor={vista}
        items={[
          { id: 'revisiones', etiqueta: 'Revisiones realizadas', to: pathname },
          { id: 'estados', etiqueta: 'Estados de revisión', to: `${pathname}?vista=estados` },
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
