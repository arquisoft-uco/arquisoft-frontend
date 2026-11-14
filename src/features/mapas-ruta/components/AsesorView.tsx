import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarMapasRutaAsesor from './asesor/ConsultarMapasRutaAsesor';

export default function AsesorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mapas de ruta"
        descripcion="Consulta el mapa de ruta de los proyectos que asesoras."
      />
      <ConsultarMapasRutaAsesor />
    </div>
  );
}
