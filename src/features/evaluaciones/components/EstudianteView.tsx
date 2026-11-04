import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarEvaluacionesEstudiante from './estudiante/ConsultarEvaluacionesEstudiante';

export default function EstudianteView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Evaluaciones"
        descripcion="Consulta las evaluaciones de los entregables de tu proyecto de grado."
      />
      <ConsultarEvaluacionesEstudiante />
    </div>
  );
}
