import { useId } from 'react';
import { useTextoConRetardo } from '../../hooks/useTextoConRetardo';

const SECCION = 'flex flex-col gap-2.5 sm:gap-2';
const ETIQUETA = 'text-sm font-semibold text-on-surface sm:font-medium';

interface Props {
  etiqueta: string;
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder?: string;
}

export default function FilterBarSeccionTexto({ etiqueta, valor, onCambiar, placeholder }: Props) {
  const idCampo = useId();
  const { borrador, setBorrador } = useTextoConRetardo(valor, onCambiar);

  return (
    <div className={SECCION}>
      <label htmlFor={idCampo} className={ETIQUETA}>
        {etiqueta}
      </label>
      <input
        id={idCampo}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={borrador}
        onChange={(evento) => setBorrador(evento.target.value)}
        className="field-input"
      />
    </div>
  );
}
