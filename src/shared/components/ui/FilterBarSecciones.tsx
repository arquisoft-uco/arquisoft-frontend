import type { ReactNode } from 'react';
import FilterBarSeccionFechas from './FilterBarSeccionFechas';
import FilterBarSeccionTexto from './FilterBarSeccionTexto';
import { GrupoDeChips, SeccionChips } from './FilterBarSeccionChips';
import type { OpcionFiltro } from './FilterChip';

interface SeccionBase {
  id: string;
  etiqueta: string;
}

export interface SeccionOpciones extends SeccionBase {
  tipo?: 'opciones';
  opciones: OpcionFiltro[];
  valor: string;
  onCambiar: (id: string) => void;
  deshabilitada?: boolean;
  aviso?: ReactNode;
}

export interface SeccionMultiple extends SeccionBase {
  tipo: 'multiple';
  opciones: OpcionFiltro[];
  valores: string[];
  onAlternar: (id: string) => void;
  onLimpiar: () => void;
  deshabilitada?: boolean;
  aviso?: ReactNode;
}

export interface SeccionTexto extends SeccionBase {
  tipo: 'texto';
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder?: string;
}

export interface SeccionFechas extends SeccionBase {
  tipo: 'fechas';
  desde: string;
  hasta: string;
  onCambiarDesde: (valor: string) => void;
  onCambiarHasta: (valor: string) => void;
}

export type SeccionFiltro = SeccionOpciones | SeccionMultiple | SeccionTexto | SeccionFechas;

export interface OrdenFiltro {
  etiqueta: string;
  opciones: OpcionFiltro[];
  valor: string;
  onCambiar: (id: string) => void;
}

export { SeccionChips };

export function SeccionDeFiltro({ seccion }: { seccion: SeccionFiltro }) {
  if (seccion.tipo === 'texto') {
    return (
      <FilterBarSeccionTexto
        etiqueta={seccion.etiqueta}
        valor={seccion.valor}
        onCambiar={seccion.onCambiar}
        placeholder={seccion.placeholder}
      />
    );
  }
  if (seccion.tipo === 'fechas') {
    return (
      <FilterBarSeccionFechas
        etiqueta={seccion.etiqueta}
        desde={seccion.desde}
        hasta={seccion.hasta}
        onCambiarDesde={seccion.onCambiarDesde}
        onCambiarHasta={seccion.onCambiarHasta}
      />
    );
  }
  if (seccion.tipo === 'multiple') {
    return (
      <GrupoDeChips
        etiqueta={seccion.etiqueta}
        opciones={seccion.opciones}
        estaActiva={(id) => seccion.valores.includes(id)}
        onElegir={seccion.onAlternar}
        deshabilitada={seccion.deshabilitada}
        aviso={seccion.aviso}
      />
    );
  }
  return <SeccionChips {...seccion} />;
}

export function limpiarSeccion(seccion: SeccionFiltro) {
  if (seccion.tipo === 'multiple') seccion.onLimpiar();
  else if (seccion.tipo === 'fechas') {
    seccion.onCambiarDesde('');
    seccion.onCambiarHasta('');
  } else seccion.onCambiar('');
}
