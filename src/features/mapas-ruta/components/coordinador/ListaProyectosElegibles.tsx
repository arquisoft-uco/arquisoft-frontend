import { useState, type FocusEventHandler, type Ref } from 'react';
import { Search } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import OpcionRadio from '../../../../shared/components/ui/OpcionRadio';
import { normalizarTexto } from '../../../../shared/hooks/useCombobox';

const ICONO =
  'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary';
const NOMBRE_GRUPO = 'proyecto-grado';

interface Opcion {
  id: string;
  etiqueta: string;
}

interface Props {
  opciones: Opcion[];
  valor: string;
  onCambiar: (id: string) => void;
  hayMas: boolean;
  cargandoMas: boolean;
  onCargarMas: () => void;
  id?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  ref?: Ref<HTMLInputElement>;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export default function ListaProyectosElegibles({
  opciones,
  valor,
  onCambiar,
  hayMas,
  cargandoMas,
  onCargarMas,
  id,
  onBlur,
  ref,
  'aria-invalid': invalido,
  'aria-describedby': descritoPor,
}: Props) {
  const [texto, setTexto] = useState('');
  const buscado = normalizarTexto(texto);
  const visibles = opciones.filter(
    (o) => o.id === valor || normalizarTexto(o.etiqueta).includes(buscado),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className={ICONO} aria-hidden />
        <input
          ref={ref}
          id={id}
          type="text"
          autoComplete="off"
          className="field-input field-input--icono"
          placeholder="Busca por título"
          value={texto}
          aria-invalid={invalido}
          aria-describedby={descritoPor}
          onChange={(evento) => setTexto(evento.target.value)}
          onBlur={onBlur}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter') evento.preventDefault();
          }}
        />
      </div>
      <div
        role="radiogroup"
        aria-label="Proyectos en proceso"
        aria-invalid={invalido}
        aria-describedby={descritoPor}
        className="flex max-h-72 flex-col gap-2 overflow-y-auto"
      >
        {visibles.length === 0 && (
          <p className="text-sm text-on-surface-secondary">No hay proyectos que coincidan.</p>
        )}
        {visibles.map((o) => (
          <OpcionRadio
            key={o.id}
            nombre={NOMBRE_GRUPO}
            valor={o.id}
            titulo={o.etiqueta}
            elegida={o.id === valor}
            onElegir={onCambiar}
          />
        ))}
      </div>
      {hayMas && (
        <Button variante="secundario" tamano="sm" cargando={cargandoMas} onClick={onCargarMas}>
          Cargar más proyectos
        </Button>
      )}
    </div>
  );
}
