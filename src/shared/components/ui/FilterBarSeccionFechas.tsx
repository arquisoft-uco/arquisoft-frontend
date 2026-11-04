import { useId } from 'react';
import { ETIQUETA, SECCION } from './filter-bar-estilos';

const CAMPOS = 'grid grid-cols-1 gap-3 sm:grid-cols-2';
const CAMPO = 'flex flex-col gap-1.5';
const SUBETIQUETA = 'text-[13px] text-on-surface-secondary';

interface Props {
  etiqueta: string;
  desde: string;
  hasta: string;
  onCambiarDesde: (valor: string) => void;
  onCambiarHasta: (valor: string) => void;
}

export default function FilterBarSeccionFechas({
  etiqueta,
  desde,
  hasta,
  onCambiarDesde,
  onCambiarHasta,
}: Props) {
  const idGrupo = useId();
  const idDesde = useId();
  const idHasta = useId();

  return (
    <div role="group" aria-labelledby={idGrupo} className={SECCION}>
      <span id={idGrupo} className={ETIQUETA}>
        {etiqueta}
      </span>
      <div className={CAMPOS}>
        <div className={CAMPO}>
          <label htmlFor={idDesde} className={SUBETIQUETA}>
            Desde
          </label>
          <input
            id={idDesde}
            type="date"
            value={desde}
            max={hasta || undefined}
            onChange={(evento) => onCambiarDesde(evento.target.value)}
            className="field-input"
          />
        </div>
        <div className={CAMPO}>
          <label htmlFor={idHasta} className={SUBETIQUETA}>
            Hasta
          </label>
          <input
            id={idHasta}
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(evento) => onCambiarHasta(evento.target.value)}
            className="field-input"
          />
        </div>
      </div>
    </div>
  );
}
