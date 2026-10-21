import { useId, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTextoConRetardo } from '../../hooks/useTextoConRetardo';

const RAIZ = 'relative min-w-0 flex-[1_1_17.5rem]';
const ICONO =
  'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary';
const CAMPO = 'field-input field-input--icono field-input--accion';
const BORRAR =
  'absolute right-0 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-secondary hover:bg-muted sm:right-1 sm:size-9';

interface Props {
  valor: string;
  onCambiar: (valor: string) => void;
  etiqueta: string;
  placeholder: string;
}

export default function FilterBarBusqueda({ valor, onCambiar, etiqueta, placeholder }: Props) {
  const idCampo = useId();
  const campo = useRef<HTMLInputElement>(null);
  const { borrador, setBorrador, borrar } = useTextoConRetardo(valor, onCambiar);

  function borrarYEnfocar() {
    borrar();
    campo.current?.focus();
  }

  return (
    <div className={RAIZ}>
      <label htmlFor={idCampo} className="sr-only">
        {etiqueta}
      </label>
      <Search size={16} aria-hidden className={ICONO} />
      <input
        ref={campo}
        id={idCampo}
        type="text"
        inputMode="search"
        autoComplete="off"
        placeholder={placeholder}
        value={borrador}
        onChange={(evento) => setBorrador(evento.target.value)}
        className={CAMPO}
      />
      {borrador.length > 0 && (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          onClick={borrarYEnfocar}
          className={BORRAR}
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}
