import { useId, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

export interface ControlDeCampo {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

interface Contador {
  actual: number;
  max: number;
}

const PROPORCION_CERCA_DEL_MAXIMO = 0.9;

const RAIZ = 'flex min-w-0 flex-col';
const RAIZ_CORTA = 'max-w-60';
const OPCIONAL = 'font-normal text-on-surface-secondary';
const PIE = 'flex items-start justify-between gap-3';
const ERROR = 'field-error flex items-start gap-1.5';
const CONTADOR = 'mt-1 ml-auto shrink-0 text-xs tabular-nums';
const CONTADOR_EN_REPOSO = 'text-on-surface-secondary';
const CONTADOR_CERCA = 'font-semibold text-tertiary-muted-foreground';

function clasesDelContador({ actual, max }: Contador) {
  const cerca = actual >= PROPORCION_CERCA_DEL_MAXIMO * max;
  return [CONTADOR, cerca ? CONTADOR_CERCA : CONTADOR_EN_REPOSO].join(' ');
}

interface Props {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opcional?: boolean;
  corto?: boolean;
  contador?: Contador;
  children: (control: ControlDeCampo) => ReactNode;
}

export default function Field({
  etiqueta,
  ayuda,
  error,
  opcional,
  corto,
  contador,
  children,
}: Props) {
  const id = useId();
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;

  let idDescripcion: string | undefined;
  if (error) idDescripcion = idError;
  else if (ayuda) idDescripcion = idAyuda;

  return (
    <div className={corto ? [RAIZ, RAIZ_CORTA].join(' ') : RAIZ}>
      <label htmlFor={id} className="field-label">
        {etiqueta}
        {opcional && <span className={OPCIONAL}> (opcional)</span>}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': idDescripcion })}
      {(error || ayuda || contador) && (
        <div className={PIE}>
          {error && (
            <p id={idError} role="alert" className={ERROR}>
              <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
              {error}
            </p>
          )}
          {!error && ayuda && (
            <p id={idAyuda} className="field-hint">
              {ayuda}
            </p>
          )}
          {contador && (
            <span className={clasesDelContador(contador)}>
              {`${contador.actual}/${contador.max}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
