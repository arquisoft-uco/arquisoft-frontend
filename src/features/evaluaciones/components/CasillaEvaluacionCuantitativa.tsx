const ETIQUETA = 'tap-target inline-flex cursor-pointer items-center';
const CASILLA = 'checkbox-control shrink-0 accent-primary';

interface Props {
  fila: { id: string; item: { nombre: string } };
  marcada: boolean;
  onAlternar: (id: string) => void;
}

export default function CasillaEvaluacionCuantitativa({ fila, marcada, onAlternar }: Props) {
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
