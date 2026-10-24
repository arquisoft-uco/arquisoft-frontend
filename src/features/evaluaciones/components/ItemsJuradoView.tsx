import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import ItemsCualitativosJuradoView from './ItemsCualitativosJuradoView';
import ItemsCuantitativosJuradoView from './ItemsCuantitativosJuradoView';

type Pestana = 'cualitativos' | 'cuantitativos';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'cualitativos', etiqueta: 'Cualitativos' },
  { id: 'cuantitativos', etiqueta: 'Cuantitativos' },
];

export default function ItemsJuradoView() {
  const [pestana, setPestana] = useState<Pestana>('cualitativos');

  const panelPorPestana: Record<Pestana, React.ReactNode> = {
    cualitativos: <ItemsCualitativosJuradoView />,
    cuantitativos: <ItemsCuantitativosJuradoView />,
  };

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        titulo="Ítems del jurado"
        descripcion="Consulta los ítems con los que el jurado valora cada proyecto."
      />

      <Tabs
        items={PESTANAS}
        valor={pestana}
        onCambiar={setPestana}
        etiqueta="Secciones de ítems del jurado"
        idBase="items-jurado"
      >
        {panelPorPestana[pestana]}
      </Tabs>
    </div>
  );
}
