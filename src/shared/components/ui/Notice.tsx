import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';

type VarianteNotice = 'info' | 'exito' | 'advertencia' | 'peligro';

interface Aspecto {
  clases: string;
  rol: 'note' | 'status' | 'alert';
  icono: LucideIcon;
}

const BASE = 'flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm';
const ICONO = 'mt-0.5 shrink-0';
const TITULO = 'block font-semibold';
const ACCION = 'ml-auto font-semibold whitespace-nowrap underline underline-offset-4';

const ASPECTOS: Record<VarianteNotice, Aspecto> = {
  info: {
    clases: 'bg-primary-muted text-primary-muted-foreground',
    rol: 'note',
    icono: Info,
  },
  exito: {
    clases: 'bg-secondary-muted text-secondary-muted-foreground',
    rol: 'status',
    icono: CircleCheck,
  },
  advertencia: {
    clases: 'bg-tertiary-muted text-tertiary-muted-foreground',
    rol: 'note',
    icono: TriangleAlert,
  },
  peligro: {
    clases: 'bg-danger-muted text-danger-muted-foreground',
    rol: 'alert',
    icono: CircleAlert,
  },
};

interface Props {
  variante: VarianteNotice;
  titulo?: string;
  accion?: { etiqueta: string; onClick: () => void };
  etiqueta?: string;
  children: ReactNode;
  className?: string;
}

export default function Notice({ variante, titulo, accion, etiqueta, children, className }: Props) {
  const { clases, rol, icono: Icono } = ASPECTOS[variante];

  return (
    <div
      role={rol}
      aria-label={etiqueta}
      className={[BASE, clases, className].filter(Boolean).join(' ')}
    >
      <Icono size={16} className={ICONO} aria-hidden />
      <div className="min-w-0">
        {titulo && <span className={TITULO}>{titulo}</span>}
        {children}
      </div>
      {accion && (
        <button type="button" onClick={accion.onClick} className={ACCION}>
          {accion.etiqueta}
        </button>
      )}
    </div>
  );
}
