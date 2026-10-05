import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarFichasAsesor from './asesor-ficha/ConsultarFichasAsesor';

export default function AsesorFichaView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mis fichas de perfil"
        descripcion="Revisa las fichas que asesoras y abre una para ver sus ítems y estados."
      />
      <ConsultarFichasAsesor />
    </div>
  );
}
