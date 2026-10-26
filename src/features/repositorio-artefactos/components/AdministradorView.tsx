import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarRepositorios from './administrador/ConsultarRepositorios';

export default function AdministradorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Repositorio de artefactos"
        descripcion="Consulta los repositorios y sus administradores"
      />
      <ConsultarRepositorios />
    </div>
  );
}
