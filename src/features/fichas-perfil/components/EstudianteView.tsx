import { useState } from 'react';
import { useMiFichaPerfil } from '../hooks/useMiFichaPerfil';
import MiFichaHeader from './estudiante/MiFichaHeader';
import ItemsMiFichaPanel from './estudiante/ItemsMiFichaPanel';
import EstadosMiFichaPanel from './estudiante/EstadosMiFichaPanel';
import RevisionesMiFichaPanel from './estudiante/RevisionesMiFichaPanel';
import EvaluacionesMiFichaPanel from './estudiante/EvaluacionesMiFichaPanel';

type Tab = 'items' | 'estados' | 'revisiones' | 'evaluaciones';

const TABS: { key: Tab; label: string }[] = [
  { key: 'items', label: 'Ítems' },
  { key: 'estados', label: 'Estados' },
  { key: 'revisiones', label: 'Revisiones' },
  { key: 'evaluaciones', label: 'Evaluaciones' },
];

export default function EstudianteView() {
  const { ficha, isLoadingFicha } = useMiFichaPerfil();
  const [tab, setTab] = useState<Tab>('items');

  if (isLoadingFicha) {
    return (
      <div
        className="flex items-center justify-center py-16"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando ficha de perfil...</span>
        </div>
      </div>
    );
  }

  if (!ficha) {
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
      <MiFichaHeader />

      <div className="flex gap-1 rounded-lg bg-muted/50 p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-secondary hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'items' && <ItemsMiFichaPanel />}
      {tab === 'estados' && <EstadosMiFichaPanel />}
      {tab === 'revisiones' && <RevisionesMiFichaPanel />}
      {tab === 'evaluaciones' && <EvaluacionesMiFichaPanel />}
    </div>
  );
}
