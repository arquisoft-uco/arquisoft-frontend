import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarEstadosRevisionAsesor from './asesor/ConsultarEstadosRevisionAsesor';
import ConsultarRevisionesRealizadas from './asesor/ConsultarRevisionesRealizadas';

export default function AsesorView() {
  const { pathname } = useLocation();
  const vista = useParametrosListado().texto('vista') === 'estados' ? 'estados' : 'revisiones';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Revisiones de artefactos"
        descripcion="Consulta las revisiones que has realizado y los estados por los que pasan."
      />
      <Tabs
        etiqueta="Secciones de revisiones"
        valor={vista}
        items={[
          { id: 'revisiones', etiqueta: 'Revisiones realizadas', to: pathname },
          { id: 'estados', etiqueta: 'Estados de revisión', to: `${pathname}?vista=estados` },
        ]}
      />
      {vista === 'estados' ? <ConsultarEstadosRevisionAsesor /> : <ConsultarRevisionesRealizadas />}
    </div>
  );
}
