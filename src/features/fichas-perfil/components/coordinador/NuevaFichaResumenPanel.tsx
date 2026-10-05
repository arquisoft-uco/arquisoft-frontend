import { Circle, CircleCheck } from 'lucide-react';
import { LIMITES } from '../../../../shared/validation';

const TARJETA = 'flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-card';
const TITULO = 'text-xs font-semibold tracking-wider text-on-surface-secondary uppercase';
const FILA = 'flex items-start gap-2.5 text-sm';

interface FilaProps {
  etiqueta: string;
  completo: boolean;
  valor: string;
}

function Fila({ etiqueta, completo, valor }: FilaProps) {
  const Icono = completo ? CircleCheck : Circle;
  return (
    <li className={FILA}>
      <Icono
        size={16}
        aria-hidden
        className={completo ? 'mt-0.5 text-secondary' : 'mt-0.5 text-on-surface-secondary'}
      />
      <span className="flex min-w-0 flex-col">
        <span className="font-medium text-on-surface">
          {etiqueta}
          <span className="sr-only">{completo ? ': completo' : ': pendiente'}</span>
        </span>
        <span className="text-on-surface-secondary">{valor}</span>
      </span>
    </li>
  );
}

interface Props {
  titulo: string;
  asesor?: string;
  estudiantes: string[];
}

export default function NuevaFichaResumenPanel({ titulo, asesor, estudiantes }: Props) {
  const tituloLimpio = titulo.trim();

  return (
    <aside className={TARJETA} aria-label="Resumen de la ficha">
      <h2 className={TITULO}>Resumen</h2>
      <ul className="flex flex-col gap-3">
        <Fila etiqueta="Título" completo={!!tituloLimpio} valor={tituloLimpio || 'Sin definir'} />
        <Fila etiqueta="Asesor" completo={!!asesor} valor={asesor ?? 'Sin elegir'} />
        <Fila
          etiqueta="Estudiantes"
          completo={estudiantes.length > 0}
          valor={
            estudiantes.length > 0
              ? `${estudiantes.length} de ${LIMITES.ESTUDIANTES_MAX}: ${estudiantes.join(', ')}`
              : 'Sin elegir'
          }
        />
      </ul>
    </aside>
  );
}
