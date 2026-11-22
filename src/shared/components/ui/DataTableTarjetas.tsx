import type { ReactNode } from 'react';

const TARJETAS = 'flex flex-col gap-2.5 sm:hidden';
const TARJETA_BASE = 'flex flex-col gap-2.5 rounded-xl border border-border p-3.5 pr-2 shadow-card';
const TARJETA = `${TARJETA_BASE} bg-surface`;
const TARJETA_RESALTADA = `${TARJETA_BASE} bg-tertiary-muted`;
const TARJETA_FILA = 'flex items-start gap-1.5';
const TARJETA_CONTENIDO = 'flex min-w-0 flex-1 flex-col gap-2.5';

interface Props<T> {
  filas: T[];
  idDeFila: (fila: T) => string;
  etiqueta: string;
  tarjeta: (fila: T) => ReactNode;
  acciones?: (fila: T) => ReactNode;
  resaltarFila?: (fila: T) => boolean;
}

export default function DataTableTarjetas<T>({
  filas,
  idDeFila,
  etiqueta,
  tarjeta,
  acciones,
  resaltarFila,
}: Props<T>) {
  return (
    <ul aria-label={etiqueta} className={TARJETAS}>
      {filas.map((fila) => (
        <li key={idDeFila(fila)} className={resaltarFila?.(fila) ? TARJETA_RESALTADA : TARJETA}>
          <div className={TARJETA_FILA}>
            <div className={TARJETA_CONTENIDO}>{tarjeta(fila)}</div>
            {acciones?.(fila)}
          </div>
        </li>
      ))}
    </ul>
  );
}
