import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarEntregablesJurado from './jurado/ConsultarEntregablesJurado';

export default function JuradoView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Entregables"
        descripcion="Consulta los entregables de los proyectos de grado que están listos para ser evaluados."
      />
      <ConsultarEntregablesJurado />
    </div>
  );
}
