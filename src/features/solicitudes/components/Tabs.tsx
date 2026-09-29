import { useRef } from 'react';

interface Tab<K extends string> {
  key: K;
  label: string;
}

interface Props<K extends string> {
  tabs: Tab<K>[];
  activa: K;
  onCambiar: (key: K) => void;
  ariaLabel: string;
  idBase: string;
  children: React.ReactNode;
}

export default function Tabs<K extends string>({
  tabs,
  activa,
  onCambiar,
  ariaLabel,
  idBase,
  children,
}: Props<K>) {
  const botones = useRef<Record<string, HTMLButtonElement | null>>({});

  function irA(indice: number) {
    const destino = tabs[indice];
    onCambiar(destino.key);
    botones.current[destino.key]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    const ultimo = tabs.length - 1;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      irA(indice === ultimo ? 0 : indice + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      irA(indice === 0 ? ultimo : indice - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      irA(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      irA(ultimo);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1 overflow-x-auto rounded-lg bg-surface-secondary p-1"
      >
        {tabs.map((tab, indice) => {
          const seleccionada = tab.key === activa;
          const clases = [
            'tap-target justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            seleccionada
              ? 'bg-surface text-on-surface shadow-card'
              : 'text-on-surface-secondary hover:text-on-surface',
          ];

          return (
            <button
              key={tab.key}
              ref={(el) => {
                botones.current[tab.key] = el;
              }}
              type="button"
              role="tab"
              id={`${idBase}-tab-${tab.key}`}
              aria-selected={seleccionada}
              aria-controls={`${idBase}-panel-${tab.key}`}
              tabIndex={seleccionada ? 0 : -1}
              className={clases.join(' ')}
              onClick={() => onCambiar(tab.key)}
              onKeyDown={(e) => handleKeyDown(e, indice)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${idBase}-panel-${activa}`}
        aria-labelledby={`${idBase}-tab-${activa}`}
      >
        {children}
      </div>
    </div>
  );
}
