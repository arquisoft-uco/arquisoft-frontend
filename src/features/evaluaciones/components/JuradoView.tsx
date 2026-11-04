import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import ConsultarEvaluacionesAsignadasJurado from './jurado/ConsultarEvaluacionesAsignadasJurado';
import ItemsCualitativosJuradoView from './ItemsCualitativosJuradoView';
import ItemsCuantitativosJuradoView from './ItemsCuantitativosJuradoView';

type Pestana = 'evaluaciones' | 'cualitativos' | 'cuantitativos';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'evaluaciones', etiqueta: 'Mis evaluaciones' },
  { id: 'cualitativos', etiqueta: 'Ítems cualitativos' },
  { id: 'cuantitativos', etiqueta: 'Ítems cuantitativos' },
];

export default function JuradoView() {
  const [pestana, setPestana] = useState<Pestana>('evaluaciones');

  const panelPorPestana: Record<Pestana, React.ReactNode> = {
    evaluaciones: <ConsultarEvaluacionesAsignadasJurado />,
    cualitativos: <ItemsCualitativosJuradoView />,
    cuantitativos: <ItemsCuantitativosJuradoView />,
  };

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        titulo="Evaluaciones"
        descripcion="Consulta las evaluaciones que te asignó el coordinador y los ítems con los que valoras cada proyecto."
      />

      <Tabs
        items={PESTANAS}
        valor={pestana}
        onCambiar={setPestana}
        etiqueta="Secciones de evaluaciones del jurado"
        idBase="evaluaciones-jurado"
      >
        {panelPorPestana[pestana]}
      </Tabs>
    </div>
  );
}
