import PageHeader from '../../../shared/components/ui/PageHeader';
import SolicitudesRecibidasPanel from './coordinador/SolicitudesRecibidasPanel';

export default function CoordinadorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Solicitudes" descripcion="Consulta las novedades que te han enviado." />

      <SolicitudesRecibidasPanel />
    </div>
  );
}
