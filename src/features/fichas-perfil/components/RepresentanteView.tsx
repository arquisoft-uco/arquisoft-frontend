import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarFichasDisponibles from './representante/ConsultarFichasDisponibles';

export default function RepresentanteView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Fichas de perfil"
        descripcion="Fichas disponibles para que inicies su evaluación."
      />
      <ConsultarFichasDisponibles />
    </div>
  );
}
