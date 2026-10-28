import { useState, type ComponentProps } from 'react';
import { CalendarRange, SlidersHorizontal } from 'lucide-react';
import { textoRangoFechas } from '../../utils/formato-fecha';
import FilterBarAplicados from './FilterBarAplicados';
import FilterBarBusqueda from './FilterBarBusqueda';
import FilterBarDesplegable from './FilterBarDesplegable';
import type { OrdenFiltro, SeccionFiltro } from './FilterBarSecciones';
import FilterChip, { type OpcionFiltro } from './FilterChip';

export type { OpcionFiltro, OrdenFiltro, SeccionFiltro };

const RAIZ =
  'relative flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4 shadow-card';
const FILA = 'flex flex-wrap gap-3';
const CONTADOR =
  'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground';
const CHIPS =
  'flex gap-2 overflow-x-auto -mx-4 px-4 py-1 -my-1 sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0';

interface Props {
  busqueda?: ComponentProps<typeof FilterBarBusqueda>;
  chips?: {
    etiqueta: string;
    opciones: OpcionFiltro[];
    seleccionados: string[];
    onAlternar: (id: string) => void;
    onTodos: () => void;
  };
  fechas?: {
    etiqueta: string;
    desde: string;
    hasta: string;
    onCambiarDesde: (valor: string) => void;
    onCambiarHasta: (valor: string) => void;
  };
  popover?: { secciones: SeccionFiltro[] };
  orden?: OrdenFiltro;
  aplicados: { id: string; etiqueta: string; onQuitar: () => void }[];
  onLimpiar: () => void;
  totalResultados?: number;
}

export default function FilterBar({
  busqueda,
  chips,
  fechas,
  popover,
  orden,
  aplicados,
  onLimpiar,
  totalResultados,
}: Props) {
  const [claveBusqueda, setClaveBusqueda] = useState(0);

  const hayFechas = Boolean(fechas && (fechas.desde || fechas.hasta));
  const filtrosActivos =
    (busqueda?.valor.trim() ? 1 : 0) +
    (chips?.seleccionados.length ?? 0) +
    aplicados.length +
    (hayFechas ? 1 : 0);

  function limpiarTodo() {
    onLimpiar();
    setClaveBusqueda((clave) => clave + 1);
  }

  return (
    <section aria-label="Búsqueda y filtros" className={RAIZ}>
      {(busqueda || fechas || popover) && (
        <div className={FILA}>
          {busqueda && <FilterBarBusqueda key={claveBusqueda} {...busqueda} />}
          {fechas && (
            <FilterBarDesplegable
              icono={CalendarRange}
              texto={hayFechas ? textoRangoFechas(fechas.desde, fechas.hasta) : fechas.etiqueta}
              nombreAccesible={
                hayFechas
                  ? `${fechas.etiqueta}: ${textoRangoFechas(fechas.desde, fechas.hasta)}`
                  : undefined
              }
              secciones={[{ tipo: 'fechas', id: 'fechas', ...fechas }]}
              hayAplicados={hayFechas}
              titulo={fechas.etiqueta}
              etiquetaPanel={fechas.etiqueta}
            />
          )}
          {popover && (
            <FilterBarDesplegable
              icono={SlidersHorizontal}
              texto={
                <>
                  Filtros{' '}
                  {aplicados.length > 0 && <span className={CONTADOR}>{aplicados.length}</span>}
                </>
              }
              secciones={popover.secciones}
              orden={orden}
              totalResultados={totalResultados}
              hayAplicados={aplicados.length > 0}
              anclaIzquierda={!busqueda && !fechas}
            />
          )}
        </div>
      )}
      {chips && (
        <div role="group" aria-label={chips.etiqueta} className={CHIPS}>
          <FilterChip
            etiqueta="Todos"
            activo={chips.seleccionados.length === 0}
            onClick={() => chips.onTodos()}
          />
          {chips.opciones.map((opcion) => (
            <FilterChip
              key={opcion.id}
              etiqueta={opcion.etiqueta}
              activo={chips.seleccionados.includes(opcion.id)}
              onClick={() => chips.onAlternar(opcion.id)}
            />
          ))}
        </div>
      )}
      {(aplicados.length > 0 || filtrosActivos > 1) && (
        <FilterBarAplicados
          aplicados={aplicados}
          mostrarLimpiarTodo={filtrosActivos > 1}
          onLimpiarTodo={limpiarTodo}
        />
      )}
    </section>
  );
}
