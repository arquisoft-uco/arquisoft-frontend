import { useId, type KeyboardEvent } from 'react';
import { Check, CircleAlert, X } from 'lucide-react';
import IconButton from '../../../shared/components/ui/IconButton';
import { LIMITES } from '../../../shared/validation';

const DIGITOS_MAXIMOS = String(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX).length;
const RAIZ = 'flex min-w-0 flex-col gap-1';
const CONTROLES = 'flex items-center gap-1.5';
const ERROR = 'field-error flex items-start gap-1.5';

interface Props {
  nombreItem: string;
  valorMaximo: number;
  valor: string;
  error?: string;
  guardando: boolean;
  onCambiar: (puntaje: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}

export default function EditorPuntajeEnLinea({
  nombreItem,
  valorMaximo,
  valor,
  error,
  guardando,
  onCambiar,
  onGuardar,
  onCancelar,
}: Props) {
  const id = useId();
  const idMensaje = `${id}-${error ? 'error' : 'ayuda'}`;

  function alPulsarTecla(evento: KeyboardEvent) {
    if (guardando) return;
    if (evento.key === 'Escape') {
      evento.stopPropagation();
      onCancelar();
    } else if (evento.key === 'Enter' && evento.target instanceof HTMLInputElement) {
      evento.preventDefault();
      onGuardar();
    }
  }

  return (
    <div className={RAIZ} onKeyDown={alPulsarTecla}>
      <div className={CONTROLES}>
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={DIGITOS_MAXIMOS}
          aria-label={`Puntaje de ${nombreItem}`}
          aria-invalid={!!error}
          aria-describedby={idMensaje}
          className="field-input min-w-0 flex-1"
          value={valor}
          disabled={guardando}
          onChange={(e) => onCambiar(e.target.value)}
        />
        <IconButton
          etiqueta={`Guardar puntaje de ${nombreItem}`}
          icono={Check}
          tono="primario"
          disabled={guardando}
          onClick={onGuardar}
        />
        <IconButton
          etiqueta={`Cancelar cambio de puntaje de ${nombreItem}`}
          icono={X}
          disabled={guardando}
          onClick={onCancelar}
        />
      </div>
      {error ? (
        <p id={idMensaje} role="alert" className={ERROR}>
          <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        <p id={idMensaje} className="field-hint">
          Entre {LIMITES.ITEM_CUANTITATIVO_VALOR_MIN} y {valorMaximo}
        </p>
      )}
    </div>
  );
}
