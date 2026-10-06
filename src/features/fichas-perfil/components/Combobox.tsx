import { useEffect, useRef, type FocusEventHandler, type Ref } from 'react';
import { Search } from 'lucide-react';
import { useCombobox, type OpcionCombobox } from '../../../shared/hooks/useCombobox';
import ComboboxElegidos, { TarjetaElegida } from './ComboboxElegidos';
import ComboboxLista from './ComboboxLista';
export type { OpcionCombobox } from '../../../shared/hooks/useCombobox';

const ICONO =
  'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary';
interface Comunes {
  opciones: OpcionCombobox[];
  textoVacio: string;
  etiquetaElegidos: string;
  id?: string;
  placeholder?: string;
  deshabilitado?: boolean;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  ref?: Ref<HTMLInputElement>;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

interface Unica extends Comunes {
  multiple?: false;
  valor: string;
  onCambiar: (id: string) => void;
  max?: undefined;
}

interface Multiple extends Comunes {
  multiple: true;
  valor: string[];
  onCambiar: (ids: string[]) => void;
  max?: number;
}

type Props = Unica | Multiple;

export default function Combobox(props: Props) {
  const { opciones, id, ref } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const elegidosRef = useRef<HTMLDivElement>(null);
  const enfocarAlCambiar = useRef(false);

  const ids = props.multiple ? props.valor : props.valor ? [props.valor] : [];
  const lleno = props.multiple && props.max !== undefined && ids.length >= props.max;
  const bloqueado = !!props.deshabilitado || lleno;
  const llenoAntes = useRef(lleno);
  const elegidos = ids.flatMap((idElegido) => opciones.find((o) => o.id === idElegido) ?? []);

  function elegirOpcion(idOpcion: string) {
    if (props.multiple) props.onCambiar([...props.valor, idOpcion]);
    else props.onCambiar(idOpcion);
  }

  function quitar(idOpcion: string) {
    enfocarAlCambiar.current = true;
    if (props.multiple) props.onCambiar(props.valor.filter((v) => v !== idOpcion));
    else props.onCambiar('');
  }

  const combo = useCombobox({
    opciones,
    elegidos: ids,
    onElegir: elegirOpcion,
    cerrarAlElegir: !props.multiple,
    deshabilitado: bloqueado,
  });

  useEffect(() => {
    if (!enfocarAlCambiar.current) return;
    enfocarAlCambiar.current = false;
    inputRef.current?.focus();
  }, [props.valor]);

  useEffect(() => {
    const botones = elegidosRef.current?.querySelectorAll('button');
    if (lleno && !llenoAntes.current) botones?.[botones.length - 1]?.focus();
    llenoAntes.current = lleno;
  }, [lleno]);

  function asignarRef(el: HTMLInputElement | null) {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  }

  const unico = props.multiple ? undefined : elegidos[0];
  if (unico) {
    const describedby = props['aria-describedby'];
    return (
      <TarjetaElegida
        id={id}
        opcion={unico}
        aria-describedby={describedby}
        deshabilitado={props.deshabilitado}
        onCambiar={() => quitar(unico.id)}
      />
    );
  }

  return (
    <div>
      <div ref={combo.contenedorRef} className="relative">
        <Search className={ICONO} aria-hidden />
        <input
          ref={asignarRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          className="field-input field-input--icono"
          placeholder={props.placeholder}
          value={combo.texto}
          disabled={bloqueado}
          aria-expanded={combo.abierta}
          aria-controls={combo.idLista}
          aria-autocomplete="list"
          aria-activedescendant={combo.idActivoDom}
          aria-invalid={props['aria-invalid']}
          aria-describedby={props['aria-describedby']}
          onChange={(evento) => combo.setTexto(evento.target.value)}
          onClick={combo.abrir}
          onKeyDown={combo.alPulsarTecla}
          onBlur={props.onBlur}
        />
        {combo.abierta && (
          <ComboboxLista
            idLista={combo.idLista}
            etiqueta="Opciones"
            opciones={combo.opcionesVisibles}
            textoVacio={props.textoVacio}
            onElegir={combo.elegir}
          />
        )}
      </div>
      {lleno && <p className="mt-1.5 text-xs text-on-surface-secondary">Alcanzaste el máximo.</p>}
      <div ref={elegidosRef}>
        {props.multiple && (
          <ComboboxElegidos
            etiqueta={props.etiquetaElegidos}
            elegidos={elegidos}
            max={props.max}
            onQuitar={quitar}
          />
        )}
      </div>
    </div>
  );
}
