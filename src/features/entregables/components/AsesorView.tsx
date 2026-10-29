import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarEstadosEntregableAsesor from './asesor/ConsultarEstadosEntregableAsesor';

export default function AsesorView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Entregables"
        descripcion="Consulta los estados por los que pasa un entregable."
      />
      <ConsultarEstadosEntregableAsesor />
    </div>
  );
}
