import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { LIMITES } from '../../../shared/validation';

const DIGITOS_MAXIMOS = String(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX).length;
const CAMPO = 'w-full max-w-60';
const ERROR = 'field-error flex items-start gap-1.5';

interface Props {
  item: { id: string; nombre: string; valor: number };
  puntaje: string;
  error?: string;
  onCambiar: (texto: string) => void;
  onSalirDelCampo: () => void;
  deshabilitado?: boolean;
}

export default function ValoracionPuntajeEnLinea({
  item,
  puntaje,
  error,
  onCambiar,
  onSalirDelCampo,
  deshabilitado,
}: Props) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;

  return (
    <div className={CAMPO}>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={DIGITOS_MAXIMOS}
        aria-label={`Puntaje de ${item.nombre}`}
        aria-invalid={!!error}
        aria-describedby={error ? idError : idAyuda}
        data-valoracion-item={item.id}
        className="field-input"
        value={puntaje}
        disabled={deshabilitado}
        onChange={(e) => onCambiar(e.target.value)}
        onBlur={onSalirDelCampo}
      />
      {error ? (
        <p id={idError} role="alert" className={ERROR}>
          <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        <p id={idAyuda} className="field-hint">
          Entre {LIMITES.ITEM_CUANTITATIVO_VALOR_MIN} y {item.valor}
        </p>
      )}
    </div>
  );
}
