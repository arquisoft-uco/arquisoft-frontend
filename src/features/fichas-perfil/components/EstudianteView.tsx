import { useState } from 'react';
import { useMiFichaPerfil } from '../hooks/useMiFichaPerfil';
import LoadingState from '../../../shared/components/ui/LoadingState';
import Tabs from '../../../shared/components/ui/Tabs';
import MiFichaHeader from './estudiante/MiFichaHeader';
import ItemsMiFichaPanel from './estudiante/ItemsMiFichaPanel';
import EstadosMiFichaPanel from './estudiante/EstadosMiFichaPanel';
import RevisionesMiFichaPanel from './estudiante/RevisionesMiFichaPanel';
import EvaluacionesMiFichaPanel from './estudiante/EvaluacionesMiFichaPanel';
import TiposItemPanel from './TiposItemPanel';
import SelectorFichaEstudiante from './estudiante/SelectorFichaEstudiante';

type Tab = 'items' | 'estados' | 'revisiones' | 'evaluaciones' | 'tipos-item';

const TABS: { id: Tab; etiqueta: string }[] = [
  { id: 'items', etiqueta: 'Ítems' },
  { id: 'estados', etiqueta: 'Estados' },
  { id: 'revisiones', etiqueta: 'Revisiones' },
  { id: 'evaluaciones', etiqueta: 'Evaluaciones' },
  { id: 'tipos-item', etiqueta: 'Tipos de ítem' },
];

export default function EstudianteView() {
  const { ficha, fichas, isLoadingFicha, sinFicha, errorFicha, seleccionarFicha } =
    useMiFichaPerfil();
  const [tab, setTab] = useState<Tab>('items');

  if (isLoadingFicha) {
    return <LoadingState etiqueta="Cargando ficha de perfil..." />;
  }

  if (errorFicha) {
    return (
      <div role="alert" className="py-16 text-center">
        <p className="text-lg font-medium text-on-surface">
          No pudimos cargar tu ficha de perfil. Intenta de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (sinFicha || !ficha) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-on-surface">
          No tienes una ficha de perfil asignada
        </p>
        <p className="mt-1 text-sm text-on-surface-secondary">
          Contacta al coordinador para ser asignado a una ficha.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fichas.length > 1 && (
        <SelectorFichaEstudiante
          fichas={fichas}
          fichaActivaId={ficha.id}
          onSeleccionar={seleccionarFicha}
        />
      )}
      <MiFichaHeader />

      <Tabs items={TABS} valor={tab} onCambiar={setTab} etiqueta="Secciones de mi ficha">
        {tab === 'items' && <ItemsMiFichaPanel />}
        {tab === 'estados' && <EstadosMiFichaPanel />}
        {tab === 'revisiones' && <RevisionesMiFichaPanel />}
        {tab === 'evaluaciones' && <EvaluacionesMiFichaPanel />}
        {tab === 'tipos-item' && <TiposItemPanel />}
      </Tabs>
    </div>
  );
}
