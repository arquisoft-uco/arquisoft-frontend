import { useId } from 'react';

const SECCION = 'flex flex-col gap-2.5 sm:gap-2';
const ETIQUETA = 'text-sm font-semibold text-on-surface sm:font-medium';

export interface PropsSeccionFecha {
  etiqueta: string;
  valor: string;
  onCambiar: (valor: string) => void;
  min?: string;
  max?: string;
}

export default function FilterBarSeccionFecha({
  etiqueta,
  valor,
  onCambiar,
  min,
  max,
}: PropsSeccionFecha) {
  const idCampo = useId();

  return (
    <div className={SECCION}>
      <label htmlFor={idCampo} className={ETIQUETA}>
        {etiqueta}
      </label>
      <input
        id={idCampo}
        type="date"
        value={valor}
        min={min || undefined}
        max={max || undefined}
        onChange={(evento) => onCambiar(evento.target.value)}
        className="field-input"
      />
    </div>
  );
}
