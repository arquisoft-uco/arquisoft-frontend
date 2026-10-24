import { useId } from 'react';
import type { ReactNode } from 'react';
import FilterBarSeccionTexto from './FilterBarSeccionTexto';
import FilterChip from './FilterChip';
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

export type SeccionFiltro = SeccionOpciones | SeccionMultiple | SeccionTexto;

export interface OrdenFiltro {
  etiqueta: string;
  opciones: OpcionFiltro[];
  valor: string;
  onCambiar: (id: string) => void;
}

const SECCION = 'flex flex-col gap-2.5 sm:gap-2';
const ETIQUETA = 'text-sm font-semibold text-on-surface sm:font-medium';
const OPCIONES = 'flex flex-wrap gap-2';

interface PropsGrupo {
  etiqueta: string;
  opciones: OpcionFiltro[];
  estaActiva: (id: string) => boolean;
  onElegir: (id: string) => void;
  deshabilitada?: boolean;
  aviso?: ReactNode;
  className?: string;
}

function GrupoDeChips({
  etiqueta,
  opciones,
  estaActiva,
  onElegir,
  deshabilitada,
  aviso,
  className,
}: PropsGrupo) {
  const idEtiqueta = useId();

  return (
    <div className={[SECCION, className].filter(Boolean).join(' ')}>
      <span id={idEtiqueta} className={ETIQUETA}>
        {etiqueta}
      </span>
      <div role="group" aria-labelledby={idEtiqueta} className={OPCIONES}>
        {opciones.map((opcion) => (
          <FilterChip
            key={opcion.id}
            etiqueta={opcion.etiqueta}
            activo={estaActiva(opcion.id)}
            disabled={deshabilitada}
            onClick={() => onElegir(opcion.id)}
          />
        ))}
      </div>
      {aviso}
    </div>
  );
}

export function SeccionChips({
  etiqueta,
  opciones,
  valor,
  onCambiar,
  deshabilitada,
  aviso,
  className,
}: Omit<SeccionOpciones, 'id' | 'tipo'> & { className?: string }) {
  return (
    <GrupoDeChips
      etiqueta={etiqueta}
      opciones={opciones}
      estaActiva={(id) => id === valor}
      onElegir={onCambiar}
      deshabilitada={deshabilitada}
      aviso={aviso}
      className={className}
    />
  );
}

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
  else seccion.onCambiar('');
}
