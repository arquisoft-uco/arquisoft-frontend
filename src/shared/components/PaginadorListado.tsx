import { ChevronLeft, ChevronRight } from 'lucide-react';

const PUNTOS_INICIO = 'puntos-inicio';
const PUNTOS_FIN = 'puntos-fin';
const CASILLAS_MAXIMAS = 7;

const RAIZ = 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between';
const TEXTO = 'hidden text-sm text-on-surface-secondary sm:block';
const RESUMEN_MOVIL = 'text-sm text-on-surface-secondary sm:hidden';
const NAVEGACION = 'flex items-center justify-between gap-1 sm:justify-end';
const NUMEROS = 'hidden items-center gap-1 sm:flex';
const FLECHA =
  'inline-flex size-11 items-center justify-center rounded-lg border border-border-strong text-on-surface hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:size-9';
const NUMERO =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium';
const NUMERO_INACTIVO = 'text-on-surface-secondary hover:bg-muted';
const NUMERO_ACTIVO = 'bg-primary text-primary-foreground hover:bg-primary';
const NUMERO_PUNTOS = 'text-on-surface-secondary';

const clasesDeNumero = (activo: boolean) =>
  [NUMERO, activo ? NUMERO_ACTIVO : NUMERO_INACTIVO].join(' ');
const CLASES_DE_PUNTOS = [NUMERO, NUMERO_PUNTOS].join(' ');

type Casilla = number | typeof PUNTOS_INICIO | typeof PUNTOS_FIN;

function casillasDePaginas(actual: number, total: number): Casilla[] {
  if (total <= CASILLAS_MAXIMAS) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 4) return [1, 2, 3, 4, 5, PUNTOS_FIN, total];
  if (actual >= total - 3)
    return [1, PUNTOS_INICIO, total - 4, total - 3, total - 2, total - 1, total];
  return [1, PUNTOS_INICIO, actual - 1, actual, actual + 1, PUNTOS_FIN, total];
}

interface Props {
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  cantidadEnPagina: number;
  etiquetaPlural: string;
  onPageChange: (page: number) => void;
}

export default function PaginadorListado({
  page,
  pageSize,
  totalPages,
  totalElements,
  cantidadEnPagina,
  etiquetaPlural,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const actual = page + 1;
  const desde = totalElements === 0 ? 0 : page * pageSize + 1;
  const hasta = Math.min(page * pageSize + cantidadEnPagina, totalElements);

  return (
    <nav aria-label="Paginación" className={RAIZ}>
      <p className={TEXTO}>
        {desde}–{hasta} de {totalElements} {etiquetaPlural}
      </p>
      <div className={NAVEGACION}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Página anterior"
          className={FLECHA}
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <span className={RESUMEN_MOVIL}>
          Página {actual} de {totalPages}
        </span>
        <ul className={NUMEROS}>
          {casillasDePaginas(actual, totalPages).map((casilla) =>
            typeof casilla === 'number' ? (
              <li key={casilla}>
                <button
                  type="button"
                  onClick={() => onPageChange(casilla - 1)}
                  aria-label={`Página ${casilla}`}
                  aria-current={casilla === actual ? 'page' : undefined}
                  className={clasesDeNumero(casilla === actual)}
                >
                  {casilla}
                </button>
              </li>
            ) : (
              <li key={casilla} aria-hidden="true" className={CLASES_DE_PUNTOS}>
                …
              </li>
            ),
          )}
        </ul>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Página siguiente"
          className={FLECHA}
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </nav>
  );
}
