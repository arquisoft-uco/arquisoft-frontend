import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarEntregablesDisponibles from './ConsultarEntregablesDisponibles';
import PestanasBiblioteca from './PestanasBiblioteca';

export default function EntregablesDisponiblesView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Biblioteca"
        descripcion="Consulta los entregables aprobados que aún no tienen documentación en la biblioteca."
      />
      <PestanasBiblioteca activa="por-registrar" />
      <ConsultarEntregablesDisponibles />
    </div>
  );
}
