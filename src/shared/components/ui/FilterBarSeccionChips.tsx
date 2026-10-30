import { useId } from 'react';
import type { ReactNode } from 'react';
import FilterChip from './FilterChip';
import type { OpcionFiltro } from './FilterChip';
import { ETIQUETA, SECCION } from './filter-bar-estilos';

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

export function GrupoDeChips({
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

interface PropsChips {
  etiqueta: string;
  opciones: OpcionFiltro[];
  valor: string;
  onCambiar: (id: string) => void;
  deshabilitada?: boolean;
  aviso?: ReactNode;
  className?: string;
}

export function SeccionChips({
  etiqueta,
  opciones,
  valor,
  onCambiar,
  deshabilitada,
  aviso,
  className,
}: PropsChips) {
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
