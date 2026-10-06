import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const CONTROLES_ENFOCABLES =
  'button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]';

// Una superposición sobre otra deja actuar solo a la última capa de la pila.
const capas: symbol[] = [];
// StrictMode desmonta y vuelve a montar sin quitar el nodo: el disparador se recuerda entre las dos pasadas.
const disparadores = new WeakMap<HTMLElement, HTMLElement | null>();

export interface OpcionesTrampaDeFoco {
  contenedor: RefObject<HTMLElement | null>;
  focoInicial?: RefObject<HTMLElement | null>;
  retorno?: RefObject<HTMLElement | null>;
  alEscape?: () => void;
  esModal?: () => boolean;
}

// display no se hereda: se revisan los ancestros hasta el contenedor, no solo el control.
function estaOculto(elemento: HTMLElement, contenedor: HTMLElement): boolean {
  for (let actual: HTMLElement | null = elemento; actual; actual = actual.parentElement) {
    if (getComputedStyle(actual).display === 'none') return true;
    if (actual === contenedor) return false;
  }
  return false;
}

function esEnfocable(elemento: HTMLElement, contenedor: HTMLElement): boolean {
  return (
    elemento.matches(CONTROLES_ENFOCABLES) &&
    !elemento.matches(':disabled') &&
    elemento.tabIndex >= 0 &&
    !estaOculto(elemento, contenedor)
  );
}

function controlesVisibles(raiz: HTMLElement, contenedor: HTMLElement): HTMLElement[] {
  return Array.from(raiz.querySelectorAll<HTMLElement>(CONTROLES_ENFOCABLES)).filter((elemento) =>
    esEnfocable(elemento, contenedor),
  );
}

function elementoEnfocado(): HTMLElement | null {
  const activo = document.activeElement;
  return activo instanceof HTMLElement && activo !== document.body ? activo : null;
}

function elegirFocoInicial(nodo: HTMLElement, preferido: HTMLElement | null | undefined) {
  if (preferido) {
    if (esEnfocable(preferido, nodo)) return preferido;
    const interno = controlesVisibles(preferido, nodo)[0];
    if (interno) return interno;
  }
  return controlesVisibles(nodo, nodo)[0] ?? nodo;
}

function darLaVuelta(evento: KeyboardEvent, nodo: HTMLElement) {
  const controles = controlesVisibles(nodo, nodo);
  if (controles.length === 0) {
    evento.preventDefault();
    nodo.focus();
    return;
  }

  const primero = controles[0];
  const ultimo = controles[controles.length - 1];
  const activo = document.activeElement;

  if (!nodo.contains(activo)) {
    evento.preventDefault();
    (evento.shiftKey ? ultimo : primero).focus();
  } else if (evento.shiftKey && (activo === primero || activo === nodo)) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && activo === ultimo) {
    evento.preventDefault();
    primero.focus();
  }
}

function montarCapa(nodo: HTMLElement, opcionesRef: RefObject<OpcionesTrampaDeFoco>) {
  const capa = Symbol('capa');
  const previo = elementoEnfocado();
  const disparador =
    opcionesRef.current.retorno?.current ??
    disparadores.get(nodo) ??
    (previo && !nodo.contains(previo) ? previo : null);
  disparadores.set(nodo, disparador);
  let ultimoDentro: HTMLElement | null = null;

  const esLaDeArriba = () => capas[capas.length - 1] === capa;
  const esModal = () => opcionesRef.current.esModal?.() ?? true;

  // Fase de burbuja: un menú o un combo interno atiende primero su Esc.
  function alTeclear(evento: KeyboardEvent) {
    if (!esLaDeArriba() || evento.defaultPrevented || evento.isComposing) return;
    if (evento.key === 'Escape') opcionesRef.current.alEscape?.();
    else if (evento.key === 'Tab' && esModal()) darLaVuelta(evento, nodo);
  }

  function alEnfocar(evento: FocusEvent) {
    const destino = evento.target;
    if (!(destino instanceof HTMLElement)) return;
    if (nodo.contains(destino)) {
      ultimoDentro = destino;
      return;
    }
    if (!esLaDeArriba() || !esModal()) return;
    const anterior = ultimoDentro && esEnfocable(ultimoDentro, nodo) ? ultimoDentro : null;
    (anterior ?? controlesVisibles(nodo, nodo)[0] ?? nodo).focus({ preventScroll: true });
  }

  capas.push(capa);
  document.addEventListener('keydown', alTeclear);
  document.addEventListener('focusin', alEnfocar);

  const inicial = elegirFocoInicial(nodo, opcionesRef.current.focoInicial?.current);
  inicial.focus({ preventScroll: true });
  if (nodo.contains(inicial)) ultimoDentro = inicial;

  return () => {
    document.removeEventListener('keydown', alTeclear);
    document.removeEventListener('focusin', alEnfocar);
    const posicion = capas.indexOf(capa);
    if (posicion !== -1) capas.splice(posicion, 1);

    // El desmontaje simulado de StrictMode deja el nodo en el documento: el foco no se mueve.
    if (nodo.isConnected) return;
    disparadores.delete(nodo);

    const activo = document.activeElement;
    const sinFoco = !activo || activo === document.body || nodo.contains(activo);
    if (sinFoco && disparador?.isConnected) disparador.focus();
  };
}

export function useTrampaDeFoco(opciones: OpcionesTrampaDeFoco): void {
  const opcionesRef = useRef(opciones);

  useEffect(() => {
    opcionesRef.current = opciones;
  });

  useEffect(() => {
    const nodo = opcionesRef.current.contenedor.current;
    return nodo ? montarCapa(nodo, opcionesRef) : undefined;
  }, []);
}
