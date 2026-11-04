import type { EvaluacionCualitativaJurado } from '../models/EvaluacionCualitativaJurado';

const ETIQUETA = 'tap-target inline-flex cursor-pointer items-center';
const CASILLA = 'checkbox-control shrink-0 accent-primary';

interface Props {
  fila: EvaluacionCualitativaJurado;
  marcada: boolean;
  onAlternar: (id: string) => void;
}

export default function CasillaEvaluacionCualitativa({ fila, marcada, onAlternar }: Props) {
  return (
    <label className={ETIQUETA}>
      <input
        type="checkbox"
        checked={marcada}
        onChange={() => onAlternar(fila.id)}
        aria-label={`Seleccionar ${fila.item.nombre}`}
        className={CASILLA}
      />
    </label>
  );
}
