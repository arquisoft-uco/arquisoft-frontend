import type { Ref } from 'react';
import ComboboxElegidos from '../../../../shared/components/ui/ComboboxElegidos';
import type { OpcionCombobox } from '../../../../shared/components/ui/Combobox';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import type { CriterioItemCualitativoJurado } from '../../models/CriterioItemCualitativoJurado';
import type { ItemCualitativoJurado } from '../../models/ItemCualitativoJurado';
import type { ParEvaluacionCualitativaJurado } from '../../models/ParEvaluacionCualitativaJurado';
import SelectorParEvaluacionCualitativa from './SelectorParEvaluacionCualitativa';

const AYUDA = 'text-sm text-on-surface-secondary';

interface Props {
  items: ItemCualitativoJurado[];
  criterios: CriterioItemCualitativoJurado[];
  totalItems: number;
  totalPares: number;
  elegidos: OpcionCombobox[];
  errorLista?: string;
  mensajeEnvio: string;
  enviando: boolean;
  inputItemRef: Ref<HTMLInputElement>;
  onAgregar: (par: ParEvaluacionCualitativaJurado) => void;
  onQuitar: (itemId: string) => void;
}

export default function RegistrarEvaluacionesCualitativasCampos({
  items,
  criterios,
  totalItems,
  totalPares,
  elegidos,
  errorLista,
  mensajeEnvio,
  enviando,
  inputItemRef,
  onAgregar,
  onQuitar,
}: Props) {
  const sinCatalogo = totalItems === 0 || criterios.length === 0;

  return (
    <>
      {sinCatalogo ? (
        <Notice variante="info">
          {totalItems === 0
            ? 'Aún no hay ítems cualitativos para evaluar.'
            : 'Aún no hay criterios.'}
        </Notice>
      ) : (
        <FormSection titulo="Agregar valoración">
          <SelectorParEvaluacionCualitativa
            items={items}
            criterios={criterios}
            onAgregar={onAgregar}
            deshabilitado={enviando}
            inputItemRef={inputItemRef}
          />
        </FormSection>
      )}
      <FormSection titulo={`Valoraciones por registrar (${totalPares})`}>
        {totalPares === 0 ? (
          <p className={AYUDA}>Aún no has agregado valoraciones.</p>
        ) : (
          <ComboboxElegidos
            etiqueta="Valoraciones por registrar"
            elegidos={elegidos}
            onQuitar={onQuitar}
          />
        )}
        {errorLista && <Notice variante="peligro">{errorLista}</Notice>}
      </FormSection>
      {mensajeEnvio && <Notice variante="peligro">{mensajeEnvio}</Notice>}
    </>
  );
}
