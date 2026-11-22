import { useId, type KeyboardEvent } from 'react';
import { Check, CircleAlert, X } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { CriterioItemCualitativoJurado } from '../../models/CriterioItemCualitativoJurado';

const RAIZ = 'flex min-w-0 flex-col gap-1';
const CONTROLES = 'flex items-center gap-1.5';
const ERROR = 'field-error flex items-start gap-1.5';

interface Props {
  nombreItem: string;
  criterios: CriterioItemCualitativoJurado[];
  valor: string;
  error?: string;
  guardando: boolean;
  onCambiar: (criterioId: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}

export default function EditorCriterioEnLineaJurado({
  nombreItem,
  criterios,
  valor,
  error,
  guardando,
  onCambiar,
  onGuardar,
  onCancelar,
}: Props) {
  const idError = `${useId()}-error`;

  function alPulsarTecla(evento: KeyboardEvent) {
    if (evento.key !== 'Escape' || guardando) return;
    evento.stopPropagation();
    onCancelar();
  }

  return (
    <div className={RAIZ} onKeyDown={alPulsarTecla}>
      <div className={CONTROLES}>
        <select
          autoFocus
          aria-label={`Criterio para ${nombreItem}`}
          aria-invalid={!!error}
          aria-describedby={error ? idError : undefined}
          className="field-input min-w-0 flex-1"
          value={valor}
          disabled={guardando}
          onChange={(e) => onCambiar(e.target.value)}
        >
          <option value="">Elige un criterio</option>
          {criterios.map(({ id, nombre }) => (
            <option key={id} value={id}>
              {nombre}
            </option>
          ))}
        </select>
        <IconButton
          etiqueta={`Guardar criterio de ${nombreItem}`}
          icono={Check}
          tono="primario"
          disabled={guardando}
          onClick={onGuardar}
        />
        <IconButton
          etiqueta={`Cancelar cambio de criterio de ${nombreItem}`}
          icono={X}
          disabled={guardando}
          onClick={onCancelar}
        />
      </div>
      {error && (
        <p id={idError} role="alert" className={ERROR}>
          <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
