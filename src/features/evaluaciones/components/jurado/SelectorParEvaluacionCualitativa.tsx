import { useEffect, useRef, useState, type Ref } from 'react';
import Button from '../../../../shared/components/ui/Button';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import type { CriterioItemCualitativoJurado } from '../../models/CriterioItemCualitativoJurado';
import type { ItemCualitativoJurado } from '../../models/ItemCualitativoJurado';
import type { ParEvaluacionCualitativaJurado } from '../../models/ParEvaluacionCualitativaJurado';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  items: ItemCualitativoJurado[];
  criterios: CriterioItemCualitativoJurado[];
  onAgregar: (par: ParEvaluacionCualitativaJurado) => void;
  deshabilitado?: boolean;
  inputItemRef?: Ref<HTMLInputElement>;
}

export default function SelectorParEvaluacionCualitativa({
  items,
  criterios,
  onAgregar,
  deshabilitado,
  inputItemRef,
}: Props) {
  const [itemId, setItemId] = useState('');
  const [criterioId, setCriterioId] = useState('');
  const [reinicios, setReinicios] = useState(0);
  const itemRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (reinicios > 0) itemRef.current?.focus();
  }, [reinicios]);

  function asignarRef(el: HTMLInputElement | null) {
    itemRef.current = el;
    if (typeof inputItemRef === 'function') inputItemRef(el);
    else if (inputItemRef) inputItemRef.current = el;
  }

  function agregar() {
    onAgregar({ itemId, criterioId });
    setItemId('');
    setCriterioId('');
    setReinicios((n) => n + 1);
  }

  return (
    <div className={RAIZ}>
      <Field etiqueta="Ítem">
        {(control) => (
          <Combobox
            {...control}
            ref={asignarRef}
            opciones={items.map(({ id, nombre, descripcion }) => ({
              id,
              etiqueta: nombre,
              descripcion,
            }))}
            valor={itemId}
            onCambiar={setItemId}
            textoVacio="Ya agregaste todos los ítems."
            etiquetaElegidos="Ítem elegido"
            placeholder="Busca un ítem"
            deshabilitado={deshabilitado}
          />
        )}
      </Field>
      <Field etiqueta="Criterio">
        {(control) => (
          <Combobox
            {...control}
            opciones={criterios.map(({ id, nombre, descripcion }) => ({
              id,
              etiqueta: nombre,
              descripcion,
            }))}
            valor={criterioId}
            onCambiar={setCriterioId}
            textoVacio="No hay criterios que coincidan."
            etiquetaElegidos="Criterio elegido"
            placeholder="Busca un criterio"
            deshabilitado={deshabilitado}
          />
        )}
      </Field>
      <div className="actions-row">
        <Button
          variante="secundario"
          disabled={deshabilitado || !itemId || !criterioId}
          onClick={agregar}
        >
          Agregar a la lista
        </Button>
      </div>
    </div>
  );
}
