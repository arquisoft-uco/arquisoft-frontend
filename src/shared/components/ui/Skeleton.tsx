type VarianteSkeleton = 'tabla' | 'tarjetas' | 'formulario' | 'lineas';

const CAJA = 'flex flex-col gap-2.5 rounded-xl border border-border bg-surface-secondary p-3.5';
const COLUMNA = 'flex flex-col gap-2.5';
const TARJETA = 'flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3.5';
const FILA = 'grid grid-cols-[2.25rem_1fr_4.5rem] items-center gap-3 border-t border-border py-2.5';
const PILA = 'flex flex-col gap-1.5';

const CONTENEDORES: Record<VarianteSkeleton, string> = {
  tabla: CAJA,
  tarjetas: COLUMNA,
  formulario: CAJA,
  lineas: COLUMNA,
};

const FILAS_DE_TABLA = ['fila-1', 'fila-2', 'fila-3'];
const TARJETAS = ['tarjeta-1', 'tarjeta-2', 'tarjeta-3'];
const CAMPOS_DE_FORMULARIO = ['campo-1', 'campo-2', 'campo-3'];
const LINEAS = [
  { id: 'linea-1', clases: 'skeleton h-4 w-full' },
  { id: 'linea-2', clases: 'skeleton h-4 w-5/6' },
  { id: 'linea-3', clases: 'skeleton h-4 w-2/3' },
  { id: 'linea-4', clases: 'skeleton h-4 w-3/4' },
];

function Cuerpo({ variante }: { variante: VarianteSkeleton }) {
  switch (variante) {
    case 'tabla':
      return (
        <>
          <div className="skeleton h-3 w-2/5" />
          {FILAS_DE_TABLA.map((id) => (
            <div key={id} className={FILA}>
              <div className="skeleton size-9" />
              <div className={PILA}>
                <div className="skeleton h-3 w-3/4" />
                <div className="skeleton h-2.5 w-1/2" />
              </div>
              <div className="skeleton h-5" />
            </div>
          ))}
        </>
      );
    case 'tarjetas':
      return TARJETAS.map((id) => (
        <div key={id} className={TARJETA}>
          <div className="skeleton h-4 w-2/5" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
        </div>
      ));
    case 'formulario':
      return CAMPOS_DE_FORMULARIO.map((id) => (
        <div key={id} className={PILA}>
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-10 w-full" />
        </div>
      ));
    case 'lineas':
      return LINEAS.map(({ id, clases }) => <div key={id} className={clases} />);
  }
}

interface Props {
  variante: VarianteSkeleton;
  etiqueta: string;
  className?: string;
}

export default function Skeleton({ variante, etiqueta, className }: Props) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={[CONTENEDORES[variante], className].filter(Boolean).join(' ')}
    >
      <span className="sr-only">{etiqueta}</span>
      <Cuerpo variante={variante} />
    </div>
  );
}
