import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarEvaluacionesAsesor from './asesor/ConsultarEvaluacionesAsesor';

export default function AsesorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Evaluaciones"
        descripcion="Consulta las evaluaciones de los entregables que tienes asociadas como asesor."
      />
      <ConsultarEvaluacionesAsesor />
    </div>
  );
}
