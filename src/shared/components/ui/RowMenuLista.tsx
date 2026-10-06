import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
import { useClicFuera } from '../../hooks/useClicFuera';

export interface AccionMenu {
  etiqueta: string;
  icono?: LucideIcon;
  onSeleccionar: () => void;
  peligro?: boolean;
  deshabilitada?: boolean;
}

const ANCHO_MENU = 224;
const SEPARACION = 4;
const MARGEN = 8;

const MENU = 'fixed z-40 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-dropdown';
const ITEM =
  'flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:h-10';
const ITEM_NORMAL = 'text-on-surface enabled:hover:bg-muted';
const ITEM_PELIGRO = 'text-danger-muted-foreground enabled:hover:bg-danger-muted';
const SEPARADOR = 'my-1.5 h-px bg-border';

function itemsHabilitados(menu: HTMLElement | null): HTMLButtonElement[] {
  if (!menu) return [];
  return [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')];
}

function indiceDestino(tecla: string, actual: number, total: number): number | null {
  if (tecla === 'ArrowDown') return (actual + 1) % total;
  if (tecla === 'ArrowUp') return actual < 0 ? total - 1 : (actual - 1 + total) % total;
  if (tecla === 'Home') return 0;
  return tecla === 'End' ? total - 1 : null;
}

function posicionar(ancla: DOMRect, alto: number) {
  const izquierdaMaxima = window.innerWidth - ANCHO_MENU - MARGEN;
  const left = Math.max(MARGEN, Math.min(ancla.right - ANCHO_MENU, izquierdaMaxima));
  const debajo = ancla.bottom + SEPARACION;
  const cabeDebajo = debajo + alto <= window.innerHeight - MARGEN;
  const top = cabeDebajo ? debajo : Math.max(MARGEN, ancla.top - SEPARACION - alto);
  return { top, left };
}

interface Props {
  id: string;
  etiqueta: string;
  acciones: AccionMenu[];
  ancla: DOMRect;
  disparador: RefObject<HTMLButtonElement | null>;
  onCerrar: (devolverFoco: boolean) => void;
}

export default function RowMenuLista({
  id,
  etiqueta,
  acciones,
  ancla,
  disparador,
  onCerrar,
}: Props) {
  const menu = useRef<HTMLDivElement>(null);
  const [posicion, setPosicion] = useState(() => posicionar(ancla, 0));
  const primeraPeligro = acciones.findIndex((accion) => accion.peligro);

  useLayoutEffect(() => {
    setPosicion(posicionar(ancla, menu.current?.offsetHeight ?? 0));
  }, [ancla]);

  useEffect(() => {
    const [primero] = itemsHabilitados(menu.current);
    (primero ?? menu.current)?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const cerrar = () => onCerrar(false);
    window.addEventListener('scroll', cerrar, true);
    window.addEventListener('resize', cerrar);
    return () => {
      window.removeEventListener('scroll', cerrar, true);
      window.removeEventListener('resize', cerrar);
    };
  }, [onCerrar]);

  useClicFuera(true, [menu, disparador], () => onCerrar(false));

  function alTeclear(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === 'Escape' || evento.key === 'Tab') {
      evento.preventDefault();
      onCerrar(true);
      return;
    }
    const items = itemsHabilitados(menu.current);
    if (items.length === 0) return;
    const actual = items.findIndex((item) => item === document.activeElement);
    const destino = indiceDestino(evento.key, actual, items.length);
    if (destino === null) return;
    evento.preventDefault();
    items[destino].focus({ preventScroll: true });
  }

  function seleccionar(accion: AccionMenu) {
    onCerrar(true);
    accion.onSeleccionar();
  }

  return createPortal(
    <div
      ref={menu}
      id={id}
      role="menu"
      aria-label={etiqueta}
      tabIndex={-1}
      style={{ top: posicion.top, left: posicion.left }}
      onKeyDown={alTeclear}
      className={MENU}
    >
      {acciones.map((accion, indice) => {
        const Icono = accion.icono;
        return (
          <Fragment key={accion.etiqueta}>
            {indice === primeraPeligro && indice > 0 && (
              <div role="separator" className={SEPARADOR} />
            )}
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={accion.deshabilitada}
              onClick={() => seleccionar(accion)}
              className={[ITEM, accion.peligro ? ITEM_PELIGRO : ITEM_NORMAL].join(' ')}
            >
              {Icono && <Icono size={16} aria-hidden />}
              {accion.etiqueta}
            </button>
          </Fragment>
        );
      })}
    </div>,
    document.body,
  );
}
