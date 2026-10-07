import Notice from './Notice';

export interface ErrorDeCampo {
  campo: string;
  etiqueta: string;
  mensaje: string;
}

const LISTA = 'mt-1 list-disc space-y-1 pl-5';
const ENLACE = 'text-left underline underline-offset-4 max-sm:min-h-11';

// Tipo estructural: el formState.errors de react-hook-form lo cumple sin importar sus tipos aquí.
export function resumirErrores(
  errores: Record<string, { message?: string } | undefined>,
  etiquetas: Record<string, string>,
): ErrorDeCampo[] {
  return Object.entries(etiquetas).flatMap(([campo, etiqueta]) => {
    const mensaje = errores[campo]?.message;
    return mensaje ? [{ campo, etiqueta, mensaje }] : [];
  });
}

function tituloDelResumen(cantidad: number): string {
  return `Revisa ${cantidad} ${cantidad === 1 ? 'campo' : 'campos'} antes de continuar`;
}

interface Props {
  errores: ErrorDeCampo[];
  onIrAlCampo: (campo: string) => void;
}

export default function ErrorSummary({ errores, onIrAlCampo }: Props) {
  if (errores.length === 0) return null;

  return (
    <Notice variante="peligro" titulo={tituloDelResumen(errores.length)}>
      <ul className={LISTA}>
        {errores.map(({ campo, etiqueta, mensaje }) => (
          <li key={campo}>
            <button type="button" onClick={() => onIrAlCampo(campo)} className={ENLACE}>
              {`${etiqueta}: ${mensaje}`}
            </button>
          </li>
        ))}
      </ul>
    </Notice>
  );
}
