import { Check } from 'lucide-react';
import type { OpcionVisible } from '../../../shared/hooks/useCombobox';

const LISTA =
  'absolute inset-x-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-dropdown';
const OPCION =
  'flex min-h-12 w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm cursor-pointer';
const OPCION_ACTIVA = 'bg-muted';
const OPCION_AGREGADA = 'opacity-60 cursor-not-allowed';
const VACIO = 'px-2.5 py-3 text-sm text-on-surface-secondary';

function clasesDeOpcion({ activa, elegida }: OpcionVisible) {
  if (elegida) return [OPCION, OPCION_AGREGADA].join(' ');
  return activa ? [OPCION, OPCION_ACTIVA].join(' ') : OPCION;
}

interface Props {
  idLista: string;
  etiqueta: string;
  opciones: OpcionVisible[];
  textoVacio: string;
  onElegir: (id: string) => void;
}

export default function ComboboxLista({
  idLista,
  etiqueta,
  opciones,
  textoVacio,
  onElegir,
}: Props) {
  return (
    <ul id={idLista} role="listbox" aria-label={etiqueta} className={LISTA}>
      {opciones.length === 0 && (
        <li role="presentation" className={VACIO}>
          {textoVacio}
        </li>
      )}
      {opciones.map((opcion) => (
        <li
          key={opcion.id}
          id={opcion.idDom}
          role="option"
          aria-selected={opcion.activa}
          aria-disabled={opcion.elegida || undefined}
          className={clasesDeOpcion(opcion)}
          onMouseDown={(evento) => evento.preventDefault()}
          onClick={() => !opcion.elegida && onElegir(opcion.id)}
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium text-on-surface">{opcion.etiqueta}</span>
            {opcion.descripcion && (
              <span className="truncate text-xs text-on-surface-secondary">
                {opcion.descripcion}
              </span>
            )}
          </span>
          {opcion.elegida && (
            <span className="inline-flex items-center gap-1 text-xs text-on-surface-secondary">
              <Check size={16} aria-hidden />
              Agregada
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
