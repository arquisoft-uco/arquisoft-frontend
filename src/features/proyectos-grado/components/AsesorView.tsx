import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarProyectosGradoAsesor from './asesor/ConsultarProyectosGradoAsesor';

export default function AsesorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Proyectos de grado"
        descripcion="Consulta los proyectos de grado que asesoras."
      />
      <ConsultarProyectosGradoAsesor />
    </div>
  );
}
