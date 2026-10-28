import { useId } from 'react';
import { useTextoConRetardo } from '../../hooks/useTextoConRetardo';
import { ETIQUETA, SECCION } from './filter-bar-estilos';

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
