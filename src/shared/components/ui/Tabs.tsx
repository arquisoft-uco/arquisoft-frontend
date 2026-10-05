import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Link } from 'react-router';

interface ItemPestana<T extends string> {
  id: T;
  etiqueta: string;
  contador?: number;
  to?: string;
}

type ItemConRuta<T extends string> = ItemPestana<T> & { to: string };

const RAIZ = 'flex flex-col gap-4';
const LISTA = 'flex gap-1 overflow-x-auto border-b border-border';
// Sin -mb-px: ese solape de 1 px desborda la lista (overflow-x-auto) y abre una barra vertical.
const PESTANA =
  'inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3.5 text-sm font-medium whitespace-nowrap transition-colors';
const PESTANA_ACTIVA = 'border-primary text-primary';
const PESTANA_INACTIVA = 'border-transparent text-on-surface-secondary hover:text-on-surface';
const CONTADOR = 'rounded-full px-2 py-px text-xs font-semibold';
const CONTADOR_ACTIVO = 'bg-primary-muted text-primary-muted-foreground';
const CONTADOR_INACTIVO = 'bg-muted text-muted-foreground';

const clasesDePestana = (activa: boolean) =>
  [PESTANA, activa ? PESTANA_ACTIVA : PESTANA_INACTIVA].join(' ');

const unirClases = (...clases: (string | undefined)[]) => clases.filter(Boolean).join(' ');

function tieneRuta<T extends string>(item: ItemPestana<T>): item is ItemConRuta<T> {
  return item.to !== undefined;
}

function indiceDestino(tecla: string, actual: number, total: number): number | null {
  switch (tecla) {
    case 'ArrowRight':
      return (actual + 1) % total;
    case 'ArrowLeft':
      return (actual - 1 + total) % total;
    case 'Home':
      return 0;
    case 'End':
      return total - 1;
    default:
      return null;
  }
}

function Contador({ valor, activa }: { valor: number; activa: boolean }) {
  return (
    <span className={[CONTADOR, activa ? CONTADOR_ACTIVO : CONTADOR_INACTIVO].join(' ')}>
      {valor}
    </span>
  );
}

interface Props<T extends string> {
  items: ItemPestana<T>[];
  valor: T;
  etiqueta: string;
  idBase?: string;
  onCambiar?: (id: T) => void;
  children?: ReactNode;
  className?: string;
}

export default function Tabs<T extends string>({
  items,
  valor,
  etiqueta,
  idBase,
  onCambiar,
  children,
  className,
}: Props<T>) {
  const generado = useId();
  const base = idBase ?? generado;
  const pestanas = useRef<Record<string, HTMLButtonElement | null>>({});

  if (items.every(tieneRuta)) {
    return (
      <nav aria-label={etiqueta} className={unirClases(LISTA, className)}>
        {items.map((item) => {
          const activa = item.id === valor;
          return (
            <Link
              key={item.id}
              to={item.to}
              aria-current={activa ? 'page' : undefined}
              className={clasesDePestana(activa)}
            >
              {item.etiqueta}
              {item.contador !== undefined && <Contador valor={item.contador} activa={activa} />}
            </Link>
          );
        })}
      </nav>
    );
  }

  const idPanel = (id: T) => `${base}-panel-${id}`;
  const idPestana = (id: T) => `${base}-pestana-${id}`;
  const hayPanel = Boolean(children);
  const panelesDelConsumidor = Boolean(idBase) && !hayPanel;

  function alTeclear(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const destino = indiceDestino(evento.key, indice, items.length);
    if (destino === null) return;
    evento.preventDefault();
    const { id } = items[destino];
    onCambiar?.(id);
    pestanas.current[id]?.focus();
  }

  return (
    <div className={unirClases(RAIZ, className)}>
      <div role="tablist" aria-label={etiqueta} className={LISTA}>
        {items.map((item, indice) => {
          const activa = item.id === valor;
          return (
            <button
              key={item.id}
              ref={(elemento) => {
                pestanas.current[item.id] = elemento;
              }}
              type="button"
              role="tab"
              id={idPestana(item.id)}
              aria-selected={activa}
              aria-controls={
                (activa && hayPanel) || panelesDelConsumidor ? idPanel(item.id) : undefined
              }
              tabIndex={activa ? 0 : -1}
              onClick={() => onCambiar?.(item.id)}
              onKeyDown={(evento) => alTeclear(evento, indice)}
              className={clasesDePestana(activa)}
            >
              {item.etiqueta}
              {item.contador !== undefined && <Contador valor={item.contador} activa={activa} />}
            </button>
          );
        })}
      </div>
      {hayPanel && (
        <div role="tabpanel" id={idPanel(valor)} aria-labelledby={idPestana(valor)}>
          {children}
        </div>
      )}
    </div>
  );
}
