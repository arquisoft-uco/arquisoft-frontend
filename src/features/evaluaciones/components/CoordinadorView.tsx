import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarEvaluacionesCoordinador from './coordinador/ConsultarEvaluacionesCoordinador';

export default function CoordinadorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Evaluaciones"
        descripcion="Consulta las evaluaciones de los proyectos de grado."
      />
      <ConsultarEvaluacionesCoordinador />
    </div>
  );
}
