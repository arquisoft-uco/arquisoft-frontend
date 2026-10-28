import { useRef } from 'react';
import type { RefObject } from 'react';
import { X } from 'lucide-react';
import { useTrampaDeFoco } from '../../hooks/useTrampaDeFoco';
import Button from './Button';
import IconButton from './IconButton';
import { SeccionChips, SeccionDeFiltro, limpiarSeccion } from './FilterBarSecciones';
import type { OrdenFiltro, SeccionFiltro } from './FilterBarSecciones';

export type { OrdenFiltro, SeccionFiltro };
export type AlineacionPanel = 'inicio' | 'fin';

const PANEL =
  'fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col rounded-t-2xl bg-surface shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:z-30 sm:mt-2 sm:max-h-none sm:w-85 sm:max-w-[calc(100vw-3rem)] sm:rounded-xl sm:border sm:border-border sm:shadow-dropdown';
const ANCLAJE: Record<AlineacionPanel, string> = { inicio: 'sm:left-0', fin: 'sm:right-0' };
const TELON = 'fixed inset-0 z-40 bg-black/40 animate-fade-in sm:hidden';
const CABECERA = 'flex shrink-0 items-center justify-between py-1 pl-5 pr-2 sm:hidden';
const TITULO = 'text-lg font-semibold text-on-surface';
const CUERPO =
  'flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pb-4 pt-2 sm:gap-4 sm:overflow-visible sm:p-4';
const SOLO_CELULAR = 'sm:hidden';
const PIE =
  'flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 pb-4 pt-3 sm:mx-4 sm:px-0';

function textoCierre(total?: number): string {
  if (total === undefined) return 'Listo';
  if (total === 0) return 'Sin resultados';
  return `Ver ${total} ${total === 1 ? 'resultado' : 'resultados'}`;
}

interface Props {
  id: string;
  ref: RefObject<HTMLDivElement | null>;
  retorno: RefObject<HTMLElement | null>;
  secciones: SeccionFiltro[];
  alineacion?: AlineacionPanel;
  orden?: OrdenFiltro;
  totalResultados?: number;
  hayAplicados: boolean;
  titulo?: string;
  etiqueta?: string;
  onCerrar: () => void;
}

export default function FilterBarPanel({
  id,
  ref,
  retorno,
  secciones,
  alineacion = 'fin',
  orden,
  totalResultados,
  hayAplicados,
  titulo = 'Filtros y orden',
  etiqueta = 'Filtros',
  onCerrar,
}: Props) {
  const telon = useRef<HTMLDivElement>(null);

  useTrampaDeFoco({
    contenedor: ref,
    retorno,
    alEscape: onCerrar,
    esModal: () => telon.current !== null && getComputedStyle(telon.current).display !== 'none',
  });

  function limpiar() {
    secciones.forEach(limpiarSeccion);
  }

  return (
    <>
      <div
        ref={ref}
        id={id}
        role="dialog"
        aria-label={etiqueta}
        tabIndex={-1}
        className={`${PANEL} ${ANCLAJE[alineacion]}`}
      >
        <div className={CABECERA}>
          <h2 className={TITULO}>{titulo}</h2>
          <IconButton etiqueta={`Cerrar ${etiqueta.toLowerCase()}`} icono={X} onClick={onCerrar} />
        </div>
        <div className={CUERPO}>
          {secciones.map((seccion) => (
            <SeccionDeFiltro key={seccion.id} seccion={seccion} />
          ))}
          {orden && <SeccionChips {...orden} className={SOLO_CELULAR} />}
        </div>
        <div className={PIE}>
          <Button variante="fantasma" tamano="sm" disabled={!hayAplicados} onClick={limpiar}>
            Limpiar
          </Button>
          <Button tamano="sm" onClick={onCerrar} className="grow sm:grow-0">
            {textoCierre(totalResultados)}
          </Button>
        </div>
      </div>
      <div
        ref={telon}
        aria-hidden="true"
        className={TELON}
        onPointerDown={(evento) => evento.stopPropagation()}
        onClick={onCerrar}
      />
    </>
  );
}
