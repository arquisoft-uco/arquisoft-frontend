import PageHeader from '../../../shared/components/ui/PageHeader';
import SolicitudesRecibidasAsesorPanel from './asesor/SolicitudesRecibidasAsesorPanel';

export default function AsesorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Solicitudes"
        descripcion="Consulta y responde las novedades que los estudiantes te han enviado."
      />

      <SolicitudesRecibidasAsesorPanel />
    </div>
  );
}
