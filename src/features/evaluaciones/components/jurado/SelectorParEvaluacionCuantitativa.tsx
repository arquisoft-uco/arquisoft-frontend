import { useEffect, useRef, useState, type Ref } from 'react';
import Button from '../../../../shared/components/ui/Button';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import { enteroEntre, LIMITES, textoRequerido } from '../../../../shared/validation';
import type { ItemCuantitativoJurado } from '../../models/ItemCuantitativoJurado';
import type { ParEvaluacionCuantitativaJurado } from '../../models/ParEvaluacionCuantitativaJurado';
import CampoObservacionEvaluacionCuantitativa from './CampoObservacionEvaluacionCuantitativa';

const RAIZ = 'flex flex-col gap-4';
const OBSERVACION_VALIDA = textoRequerido(LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX);
const DIGITOS_MAXIMOS = String(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX).length;

interface Props {
  items: ItemCuantitativoJurado[];
  nombresCategoria: ReadonlyMap<string, string>;
  onAgregar: (par: ParEvaluacionCuantitativaJurado) => void;
  deshabilitado?: boolean;
  inputItemRef?: Ref<HTMLInputElement>;
}

export default function SelectorParEvaluacionCuantitativa({
  items,
  nombresCategoria,
  onAgregar,
  deshabilitado,
  inputItemRef,
}: Props) {
  const [itemId, setItemId] = useState('');
  const [puntajeTexto, setPuntajeTexto] = useState('');
  const [observacionTexto, setObservacionTexto] = useState('');
  const [error, setError] = useState('');
  const [errorObservacion, setErrorObservacion] = useState('');
  const [reinicios, setReinicios] = useState(0);
  const itemRef = useRef<HTMLInputElement | null>(null);
  const item = items.find((i) => i.id === itemId);

  useEffect(() => {
    if (reinicios > 0) itemRef.current?.focus();
  }, [reinicios]);

  function asignarRef(el: HTMLInputElement | null) {
    itemRef.current = el;
    if (typeof inputItemRef === 'function') inputItemRef(el);
    else if (inputItemRef) inputItemRef.current = el;
  }

  function elegirItem(id: string) {
    setItemId(id);
    setError('');
  }

  function escribirPuntaje(texto: string) {
    setPuntajeTexto(texto);
    setError('');
  }

  function escribirObservacion(texto: string) {
    setObservacionTexto(texto);
    setErrorObservacion('');
  }

  function agregar() {
    if (!item) return;
    const resultado = enteroEntre(LIMITES.ITEM_CUANTITATIVO_VALOR_MIN, item.valor).safeParse(
      puntajeTexto,
    );
    if (!resultado.success) {
      setError(resultado.error.issues[0].message);
      return;
    }
    const observacion = observacionTexto.trim();
    if (observacion !== '') {
      const validada = OBSERVACION_VALIDA.safeParse(observacion);
      if (!validada.success) {
        setErrorObservacion(validada.error.issues[0].message);
        return;
      }
    }
    onAgregar({
      itemId: item.id,
      puntaje: Number(puntajeTexto.trim()),
      ...(observacion !== '' && { observacion }),
    });
    setItemId('');
    setPuntajeTexto('');
    setObservacionTexto('');
    setError('');
    setErrorObservacion('');
    setReinicios((n) => n + 1);
  }

  const ayuda = item
    ? `Entre ${LIMITES.ITEM_CUANTITATIVO_VALOR_MIN} y ${item.valor}`
    : 'Elige un ítem para ver su máximo';

  return (
    <div className={RAIZ}>
      <Field etiqueta="Ítem">
        {(control) => (
          <Combobox
            {...control}
            ref={asignarRef}
            opciones={items.map(({ id, nombre, categoriaId, valor }) => ({
              id,
              etiqueta: nombre,
              descripcion: `${nombresCategoria.get(categoriaId) ?? 'Sin categoría'} · máx. ${valor}`,
            }))}
            valor={itemId}
            onCambiar={elegirItem}
            textoVacio="Ya agregaste todos los ítems."
            etiquetaElegidos="Ítem elegido"
            placeholder="Busca un ítem"
            deshabilitado={deshabilitado}
          />
        )}
      </Field>
      <Field etiqueta="Puntaje" ayuda={ayuda} error={error || undefined} corto>
        {(control) => (
          <input
            {...control}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="field-input"
            maxLength={DIGITOS_MAXIMOS}
            value={puntajeTexto}
            disabled={deshabilitado}
            onChange={(e) => escribirPuntaje(e.target.value)}
          />
        )}
      </Field>
      <CampoObservacionEvaluacionCuantitativa
        valor={observacionTexto}
        onCambiar={escribirObservacion}
        error={errorObservacion || undefined}
        deshabilitado={deshabilitado}
      />
      <div className="actions-row">
        <Button
          variante="secundario"
          disabled={deshabilitado || !itemId || puntajeTexto.trim() === ''}
          onClick={agregar}
        >
          Agregar a la lista
        </Button>
      </div>
    </div>
  );
}
