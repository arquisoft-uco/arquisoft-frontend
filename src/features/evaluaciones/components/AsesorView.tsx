import PageHeader from '../../../shared/components/ui/PageHeader';
import ItemsCualitativosAsesorView from './ItemsCualitativosAsesorView';

export default function AsesorView() {
  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        titulo="Ítems cualitativos del asesor"
        descripcion="Consulta los ítems con los que se evalúa el desarrollo de cada proyecto de grado."
      />

      <ItemsCualitativosAsesorView />
    </div>
  );
}
