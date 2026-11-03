import type { ReactNode } from 'react';
import Avatar from './Avatar';
import Badge from './Badge';

const LISTA = 'divide-y divide-border rounded-xl border border-border';
const ITEM = 'flex items-center gap-3 py-2 pl-3';
const TEXTOS = 'flex min-w-0 flex-1 flex-col';
const FILA_NOMBRE = 'flex min-w-0 flex-wrap items-center gap-2';
const NOMBRE = 'truncate text-sm font-semibold text-on-surface';
const SUBTEXTO = 'truncate text-[13px] text-on-surface-secondary';

export interface PersonaListada {
  id: string;
  nombre: string;
  email: string;
  identificador?: string;
  vigente?: boolean;
}

interface Props<T extends PersonaListada> {
  personas: T[];
  etiqueta: string;
  accion?: (persona: T) => ReactNode;
}

export default function ListaPersonas<T extends PersonaListada>({
  personas,
  etiqueta,
  accion,
}: Props<T>) {
  return (
    <ul className={LISTA} aria-label={etiqueta}>
      {personas.map((persona) => (
        <li key={persona.id} className={`${ITEM} ${accion ? 'pr-1.5' : 'pr-3'}`}>
          <Avatar nombre={persona.nombre} />
          <div className={TEXTOS}>
            <div className={FILA_NOMBRE}>
              <span title={persona.nombre} className={NOMBRE}>
                {persona.nombre}
              </span>
              {persona.vigente === false && <Badge variante="neutro">No vigente</Badge>}
            </div>
            {persona.identificador && (
              <span title={persona.identificador} className={SUBTEXTO}>
                {persona.identificador}
              </span>
            )}
            <span title={persona.email} className={SUBTEXTO}>
              {persona.email}
            </span>
          </div>
          {accion?.(persona)}
        </li>
      ))}
    </ul>
  );
}
