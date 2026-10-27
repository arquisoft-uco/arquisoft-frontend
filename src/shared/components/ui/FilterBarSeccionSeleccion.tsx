import { useId, type ReactNode, type SyntheticEvent } from 'react';
import Combobox, { type OpcionCombobox } from './Combobox';
import { ETIQUETA, SECCION } from './filter-bar-estilos';

interface Props {
  etiqueta: string;
  opciones: OpcionCombobox[];
  valor: string;
  onCambiar: (id: string) => void;
  textoVacio: string;
  placeholder?: string;
  deshabilitada?: boolean;
  aviso?: ReactNode;
}

export default function FilterBarSeccionSeleccion({
  etiqueta,
  opciones,
  valor,
  onCambiar,
  textoVacio,
  placeholder,
  deshabilitada,
  aviso,
}: Props) {
  const idCampo = useId();

  function mostrarLista(evento: SyntheticEvent<HTMLDivElement>) {
    const contenedor = evento.currentTarget;
    requestAnimationFrame(() =>
      contenedor.querySelector('[role="listbox"]')?.scrollIntoView?.({ block: 'nearest' }),
    );
  }

  return (
    <div className={SECCION} onClick={mostrarLista} onFocus={mostrarLista}>
      <label htmlFor={idCampo} className={ETIQUETA}>
        {etiqueta}
      </label>
      <Combobox
        id={idCampo}
        opciones={opciones}
        valor={valor}
        onCambiar={onCambiar}
        textoVacio={textoVacio}
        etiquetaElegidos={etiqueta}
        placeholder={placeholder}
        deshabilitado={deshabilitada}
      />
      {aviso}
    </div>
  );
}
