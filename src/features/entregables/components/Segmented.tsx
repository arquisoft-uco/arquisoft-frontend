interface Opcion<T extends string> {
  id: T;
  etiqueta: string;
}

interface Props<T extends string> {
  opciones: Opcion<T>[];
  valor: T;
  onCambiar: (id: T) => void;
  etiqueta: string;
}

const GRUPO = 'inline-flex gap-1 self-start rounded-lg bg-muted p-1';
const OPCION = 'h-9 rounded-md px-3.5 text-sm font-medium';
const INACTIVA = 'text-muted-foreground';
const ACTIVA = 'bg-surface text-on-surface shadow-card';

export default function Segmented<T extends string>({
  opciones,
  valor,
  onCambiar,
  etiqueta,
}: Props<T>) {
  return (
    <div role="group" aria-label={etiqueta} className={GRUPO}>
      {opciones.map((opcion) => (
        <button
          key={opcion.id}
          type="button"
          aria-pressed={opcion.id === valor}
          onClick={() => onCambiar(opcion.id)}
          className={`${OPCION} ${opcion.id === valor ? ACTIVA : INACTIVA}`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}
