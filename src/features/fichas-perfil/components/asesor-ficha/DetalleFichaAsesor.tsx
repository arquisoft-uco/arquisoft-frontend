import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { FichaPerfilAsesor } from '../../models/FichaPerfilAsesor';
import ComingSoon from '../../../../shared/components/ComingSoon';
import ItemsFichaAsesorPanel from './ItemsFichaAsesorPanel';

type Tab = 'items' | 'estados' | 'revisiones' | 'evaluaciones';

const TABS: { key: Tab; label: string }[] = [
  { key: 'items', label: 'Ítems' },
  { key: 'estados', label: 'Estados' },
  { key: 'revisiones', label: 'Revisiones' },
  { key: 'evaluaciones', label: 'Evaluaciones' },
];

interface Props {
  ficha: FichaPerfilAsesor;
  onVolver: () => void;
}

export default function DetalleFichaAsesor({ ficha, onVolver }: Props) {
  const [tab, setTab] = useState<Tab>('items');

  return (
    <div className="space-y-6 animate-fade-up">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-on-surface transition-colors hover:bg-muted"
        >
          <ChevronLeft size={16} aria-hidden />
          Volver
        </button>
        <div>
          <h2 className="text-xl font-semibold text-on-surface">{ficha.titulo}</h2>
          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-on-surface-secondary">
            {ficha.estadoActual}
          </span>
        </div>
      </header>

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

      {tab === 'items' && <ItemsFichaAsesorPanel fichaPerfilId={ficha.id} />}
      {tab === 'estados' && (
        <ComingSoon title="Estados" description="El historial de estados de la ficha estará disponible próximamente." />
      )}
      {tab === 'revisiones' && (
        <ComingSoon title="Revisiones" description="Las revisiones de la ficha estarán disponibles próximamente." />
      )}
      {tab === 'evaluaciones' && (
        <ComingSoon title="Evaluaciones" description="Las evaluaciones de la ficha estarán disponibles próximamente." />
      )}
    </div>
  );
}
