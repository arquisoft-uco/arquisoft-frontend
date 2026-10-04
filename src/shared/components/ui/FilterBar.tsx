import { useId, useRef, useState, type ComponentProps } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useClicFuera } from '../../hooks/useClicFuera';
import Button from './Button';
import FilterBarBusqueda from './FilterBarBusqueda';
import FilterBarPanel, { type OrdenFiltro, type SeccionFiltro } from './FilterBarPanel';
import FilterChip, { type OpcionFiltro } from './FilterChip';

export type { OpcionFiltro, OrdenFiltro, SeccionFiltro };

const RAIZ =
  'relative flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4 shadow-card';
const FILA = 'flex flex-wrap gap-3';
const ENVOLTURA = 'relative flex-1 sm:flex-none';
const CONTADOR =
  'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground';
const CHIPS =
  'flex gap-2 overflow-x-auto -mx-4 px-4 py-1 -my-1 sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0';
const APLICADOS = 'flex flex-wrap items-center gap-2 border-t border-border pt-3';
const APLICADOS_ETIQUETA = 'text-sm text-on-surface-secondary';
const APLICADO =
  'inline-flex h-8 items-center gap-1 rounded-full bg-primary-muted pl-3 pr-1 text-sm font-medium text-primary-muted-foreground';
const QUITAR = 'inline-flex size-6 items-center justify-center rounded-full hover:bg-primary/10';
const LIMPIAR_TODO = 'text-sm font-semibold text-primary underline underline-offset-4';

interface Props {
  busqueda: ComponentProps<typeof FilterBarBusqueda>;
  chips?: {
    etiqueta: string;
    opciones: OpcionFiltro[];
    seleccionados: string[];
    onAlternar: (id: string) => void;
    onTodos: () => void;
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
  popover,
  orden,
  aplicados,
  onLimpiar,
  totalResultados,
}: Props) {
  const idPanel = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [claveBusqueda, setClaveBusqueda] = useState(0);

  useClicFuera(abierto, [boton, panel], () => setAbierto(false));

  const filtrosActivos =
    (busqueda.valor.trim() ? 1 : 0) + (chips?.seleccionados.length ?? 0) + aplicados.length;

  function cerrar() {
    setAbierto(false);
  }

  function limpiarTodo() {
    onLimpiar();
    setClaveBusqueda((clave) => clave + 1);
  }

  return (
    <section aria-label="Búsqueda y filtros" className={RAIZ}>
      <div className={FILA}>
        <FilterBarBusqueda key={claveBusqueda} {...busqueda} />
        {popover && (
          <div className={ENVOLTURA}>
            <Button
              ref={boton}
              variante="secundario"
              icono={SlidersHorizontal}
              aria-haspopup="dialog"
              aria-expanded={abierto}
              aria-controls={abierto ? idPanel : undefined}
              onClick={() => setAbierto((previo) => !previo)}
              className="w-full sm:w-auto"
            >
              Filtros {aplicados.length > 0 && <span className={CONTADOR}>{aplicados.length}</span>}
            </Button>
            {abierto && (
              <FilterBarPanel
                id={idPanel}
                ref={panel}
                retorno={boton}
                secciones={popover.secciones}
                orden={orden}
                totalResultados={totalResultados}
                hayAplicados={aplicados.length > 0}
                onCerrar={cerrar}
              />
            )}
          </div>
        )}
      </div>
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
        <div className={APLICADOS}>
          {aplicados.length > 0 && <span className={APLICADOS_ETIQUETA}>Filtros aplicados:</span>}
          {aplicados.map((aplicado) => (
            <span key={aplicado.id} className={APLICADO}>
              {aplicado.etiqueta}
              <button
                type="button"
                aria-label={`Quitar filtro ${aplicado.etiqueta}`}
                onClick={() => aplicado.onQuitar()}
                className={QUITAR}
              >
                <X size={14} aria-hidden />
              </button>
            </span>
          ))}
          {filtrosActivos > 1 && (
            <button type="button" onClick={limpiarTodo} className={LIMPIAR_TODO}>
              Limpiar todo
            </button>
          )}
        </div>
      )}
    </section>
  );
}
