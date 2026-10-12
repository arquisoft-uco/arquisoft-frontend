import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarProyectosGradoCoordinador from './coordinador/ConsultarProyectosGradoCoordinador';

export default function CoordinadorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Proyectos de grado"
        descripcion="Consulta los proyectos de grado que tienes a tu cargo."
      />
      <ConsultarProyectosGradoCoordinador />
    </div>
  );
}
