import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarFichasRepresentante from './representante/ConsultarFichasRepresentante';

export default function RepresentanteView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Fichas de perfil a evaluar"
        descripcion="Busca y abre las fichas que el comité debe revisar."
      />
      <ConsultarFichasRepresentante />
    </div>
  );
}
