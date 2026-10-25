import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarEstadosRevisionAsesor from './asesor/ConsultarEstadosRevisionAsesor';

export default function AsesorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Estados de revisión"
        descripcion="Consulta los estados por los que pasa una revisión que haces como asesor."
      />
      <ConsultarEstadosRevisionAsesor />
    </div>
  );
}
