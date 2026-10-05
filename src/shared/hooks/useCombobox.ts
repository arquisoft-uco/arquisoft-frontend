import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useClicFuera } from './useClicFuera';

export interface OpcionCombobox {
  id: string;
  etiqueta: string;
  descripcion?: string;
}

export interface OpcionVisible extends OpcionCombobox {
  idDom: string;
  elegida: boolean;
  activa: boolean;
}

interface Opciones {
  opciones: OpcionCombobox[];
  elegidos: string[];
  onElegir: (id: string) => void;
  cerrarAlElegir: boolean;
  deshabilitado?: boolean;
}

export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function useCombobox({
  opciones,
  elegidos,
  onElegir,
  cerrarAlElegir,
  deshabilitado = false,
}: Opciones) {
  const base = useId();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [texto, setTextoInterno] = useState('');
  const [abierta, setAbierta] = useState(false);
  const [activoId, setActivoId] = useState<string | null>(null);

  const buscado = normalizarTexto(texto);
  const coincidentes = opciones.filter(
    (opcion) =>
      !buscado ||
      normalizarTexto(opcion.etiqueta).includes(buscado) ||
      normalizarTexto(opcion.descripcion ?? '').includes(buscado),
  );
  const seleccionables = coincidentes.filter((opcion) => !elegidos.includes(opcion.id));
  const activoEfectivo = seleccionables.find((o) => o.id === activoId)?.id ?? seleccionables[0]?.id;

  const visibles: OpcionVisible[] = coincidentes.map((opcion) => ({
    ...opcion,
    idDom: `${base}-opcion-${opcion.id}`,
    elegida: elegidos.includes(opcion.id),
    activa: abierta && opcion.id === activoEfectivo,
  }));
  const idActivoDom = visibles.find((opcion) => opcion.activa)?.idDom;

  useClicFuera(abierta, [contenedorRef], cerrar);

  function abrir() {
    if (!deshabilitado) setAbierta(true);
  }

  function cerrar() {
    setAbierta(false);
  }

  function setTexto(valor: string) {
    setTextoInterno(valor);
    setActivoId(null);
    abrir();
  }

  function elegir(id: string) {
    if (elegidos.includes(id)) return;
    onElegir(id);
    setTextoInterno('');
    setActivoId(null);
    if (cerrarAlElegir) cerrar();
  }

  function moverA(indice: number) {
    const destino = seleccionables[indice];
    if (destino) setActivoId(destino.id);
  }

  function alPulsarTecla(evento: KeyboardEvent<HTMLInputElement>) {
    const indice = seleccionables.findIndex((opcion) => opcion.id === activoEfectivo);

    if (evento.key === 'Escape') {
      if (!abierta) return;
      evento.preventDefault();
      cerrar();
      return;
    }
    if (evento.key === 'Enter') {
      if (!abierta || !activoEfectivo) return;
      evento.preventDefault();
      elegir(activoEfectivo);
      return;
    }
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (!abierta) {
        abrir();
        return;
      }
      const paso = evento.key === 'ArrowDown' ? 1 : -1;
      moverA((indice + paso + seleccionables.length) % seleccionables.length);
      return;
    }
    if (!abierta) return;
    if (evento.key === 'Home') {
      evento.preventDefault();
      moverA(0);
    } else if (evento.key === 'End') {
      evento.preventDefault();
      moverA(seleccionables.length - 1);
    }
  }

  return {
    contenedorRef,
    idLista: `${base}-lista`,
    texto,
    setTexto,
    abierta,
    abrir,
    cerrar,
    opcionesVisibles: visibles,
    idActivoDom,
    elegir,
    alPulsarTecla,
  };
}
