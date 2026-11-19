import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import ItemsCualitativosAsesorView from './ItemsCualitativosAsesorView';
import ItemsCualitativosJuradoView from './ItemsCualitativosJuradoView';
import ItemsCuantitativosAsesorView from './ItemsCuantitativosAsesorView';
import ItemsCuantitativosJuradoView from './ItemsCuantitativosJuradoView';

type Pestana =
  | 'cualitativos-jurado'
  | 'cuantitativos-jurado'
  | 'cuantitativos-asesor'
  | 'cualitativos-asesor';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'cualitativos-jurado', etiqueta: 'Cualitativos del jurado' },
  { id: 'cuantitativos-jurado', etiqueta: 'Cuantitativos del jurado' },
  { id: 'cuantitativos-asesor', etiqueta: 'Cuantitativos del asesor' },
  { id: 'cualitativos-asesor', etiqueta: 'Cualitativos del asesor' },
];

const PANEL_POR_PESTANA: Record<Pestana, React.ReactNode> = {
  'cualitativos-jurado': <ItemsCualitativosJuradoView />,
  'cuantitativos-jurado': <ItemsCuantitativosJuradoView />,
  'cuantitativos-asesor': <ItemsCuantitativosAsesorView />,
  'cualitativos-asesor': <ItemsCualitativosAsesorView />,
};

export default function ItemsAdministradorView() {
  const [pestana, setPestana] = useState<Pestana>('cualitativos-jurado');

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        titulo="Ítems de evaluación"
        descripcion="Consulta y administra los ítems con los que el jurado y los asesores valoran cada proyecto."
      />

      <Tabs
        items={PESTANAS}
        valor={pestana}
        onCambiar={setPestana}
        etiqueta="Secciones de ítems de evaluación"
        idBase="items-administrador"
      >
        {PANEL_POR_PESTANA[pestana]}
      </Tabs>
    </div>
  );
}
