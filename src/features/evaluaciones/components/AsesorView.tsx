import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import ConsultarEvaluacionesAsesor from './asesor/ConsultarEvaluacionesAsesor';
import CategoriasItemCuantitativoAsesorPanel from './CategoriasItemCuantitativoAsesorPanel';
import ItemsCualitativosAsesorView from './ItemsCualitativosAsesorView';

type Pestana = 'evaluaciones' | 'cualitativos' | 'categorias';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'evaluaciones', etiqueta: 'Mis evaluaciones' },
  { id: 'cualitativos', etiqueta: 'Ítems cualitativos' },
  { id: 'categorias', etiqueta: 'Categorías cuantitativas' },
];

export default function AsesorView() {
  const [pestana, setPestana] = useState<Pestana>('evaluaciones');

  const panelPorPestana: Record<Pestana, React.ReactNode> = {
    evaluaciones: <ConsultarEvaluacionesAsesor />,
    cualitativos: <ItemsCualitativosAsesorView />,
    categorias: <CategoriasItemCuantitativoAsesorPanel />,
  };

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        titulo="Evaluaciones"
        descripcion="Consulta las evaluaciones de los entregables que tienes asociadas como asesor y los ítems cualitativos con los que se evalúa cada proyecto, además de las categorías de los ítems cuantitativos."
      />

      <Tabs
        items={PESTANAS}
        valor={pestana}
        onCambiar={setPestana}
        etiqueta="Secciones de evaluaciones del asesor"
        idBase="evaluaciones-asesor"
      >
        {panelPorPestana[pestana]}
      </Tabs>
    </div>
  );
}
