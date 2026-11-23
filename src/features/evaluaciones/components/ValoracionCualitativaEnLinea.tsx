interface Props {
  item: { nombre: string };
  criterios: { id: string; nombre: string }[];
  valor: string;
  onCambiar: (criterioId: string) => void;
  deshabilitado?: boolean;
}

export default function ValoracionCualitativaEnLinea({
  item,
  criterios,
  valor,
  onCambiar,
  deshabilitado,
}: Props) {
  return (
    <select
      aria-label={`Criterio para ${item.nombre}`}
      className="field-input"
      value={valor}
      disabled={deshabilitado}
      onChange={(e) => onCambiar(e.target.value)}
    >
      <option value="">Elige un criterio</option>
      {criterios.map(({ id, nombre }) => (
        <option key={id} value={id}>
          {nombre}
        </option>
      ))}
    </select>
  );
}
