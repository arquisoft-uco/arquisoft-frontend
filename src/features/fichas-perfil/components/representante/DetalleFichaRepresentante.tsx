import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { FichaPerfilRepresentante } from '../../models/FichaPerfilRepresentante';
import ItemsFichaRepresentantePanel from './ItemsFichaRepresentantePanel';
import RegistrarEvaluacionPanel from './RegistrarEvaluacionPanel';

type Tab = 'items' | 'evaluaciones';

const TABS: { key: Tab; label: string }[] = [
  { key: 'items', label: 'Ítems' },
  { key: 'evaluaciones', label: 'Evaluaciones' },
];

interface Props {
  ficha: FichaPerfilRepresentante;
  onVolver: () => void;
}

export default function DetalleFichaRepresentante({ ficha, onVolver }: Props) {
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

      {tab === 'items' && <ItemsFichaRepresentantePanel fichaPerfilId={ficha.id} />}
      {tab === 'evaluaciones' && <RegistrarEvaluacionPanel fichaPerfilId={ficha.id} />}
    </div>
  );
}
