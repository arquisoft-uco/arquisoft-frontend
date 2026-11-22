import { useId, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { LIMITES } from '../../../../shared/validation';
import type {
  ErroresValoracionBorrador,
  ValoracionBorrador,
} from '../../hooks/useBorradorEvaluacionesCuantitativasJurado';
import type { ItemCuantitativoJurado } from '../../models/ItemCuantitativoJurado';
import CampoObservacionEvaluacionCuantitativa from './CampoObservacionEvaluacionCuantitativa';

const DIGITOS_MAXIMOS = String(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX).length;
const RAIZ = 'flex min-w-0 flex-col items-start gap-2';
const CAMPO = 'w-full max-w-60';
const ERROR = 'field-error flex items-start gap-1.5';

interface Props {
  item: ItemCuantitativoJurado;
  valor: ValoracionBorrador;
  errores?: ErroresValoracionBorrador;
  onCambiar: (campo: keyof ValoracionBorrador, texto: string) => void;
  onSalirDelCampo: () => void;
  deshabilitado?: boolean;
}

export default function ValoracionCuantitativaEnLinea({
  item,
  valor,
  errores,
  onCambiar,
  onSalirDelCampo,
  deshabilitado,
}: Props) {
  const id = useId();
  const [abierta, setAbierta] = useState(false);
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const idObservacion = `${id}-observacion`;
  const conObservacion = abierta || valor.observacion !== '';

  function alternarObservacion() {
    if (conObservacion) onCambiar('observacion', '');
    setAbierta(!conObservacion);
  }

  return (
    <div className={RAIZ}>
      <div className={CAMPO}>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={DIGITOS_MAXIMOS}
          aria-label={`Puntaje de ${item.nombre}`}
          aria-invalid={!!errores?.puntaje}
          aria-describedby={errores?.puntaje ? idError : idAyuda}
          data-valoracion-item={item.id}
          className="field-input"
          value={valor.puntaje}
          disabled={deshabilitado}
          onChange={(e) => onCambiar('puntaje', e.target.value)}
          onBlur={onSalirDelCampo}
        />
        {errores?.puntaje ? (
          <p id={idError} role="alert" className={ERROR}>
            <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
            {errores.puntaje}
          </p>
        ) : (
          <p id={idAyuda} className="field-hint">
            Entre {LIMITES.ITEM_CUANTITATIVO_VALOR_MIN} y {item.valor}
          </p>
        )}
      </div>
      <Button
        variante="fantasma"
        tamano="sm"
        aria-expanded={conObservacion}
        aria-controls={conObservacion ? idObservacion : undefined}
        disabled={deshabilitado}
        onClick={alternarObservacion}
      >
        {conObservacion ? 'Quitar observación' : 'Agregar observación'}
      </Button>
      {conObservacion && (
        <div id={idObservacion} className="w-full">
          <CampoObservacionEvaluacionCuantitativa
            etiqueta={`Observación de ${item.nombre}`}
            valor={valor.observacion}
            onCambiar={(texto) => onCambiar('observacion', texto)}
            error={errores?.observacion}
            deshabilitado={deshabilitado}
          />
        </div>
      )}
    </div>
  );
}
