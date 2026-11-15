import type { Ref } from 'react';
import ComboboxElegidos from '../../../../shared/components/ui/ComboboxElegidos';
import type { OpcionCombobox } from '../../../../shared/components/ui/Combobox';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import type { ItemCuantitativoAsesor } from '../../models/ItemCuantitativoAsesor';
import type { ParEvaluacionCuantitativaAsesor } from '../../models/ParEvaluacionCuantitativaAsesor';
import SelectorParEvaluacionCuantitativa from '../jurado/SelectorParEvaluacionCuantitativa';

const AYUDA = 'text-sm text-on-surface-secondary';

interface Props {
  items: ItemCuantitativoAsesor[];
  nombresCategoria: ReadonlyMap<string, string>;
  totalPares: number;
  elegidos: OpcionCombobox[];
  errorLista?: string;
  mensajeEnvio: string;
  enviando: boolean;
  inputItemRef: Ref<HTMLInputElement>;
  onAgregar: (par: ParEvaluacionCuantitativaAsesor) => void;
  onQuitar: (itemId: string) => void;
}

export default function RegistrarEvaluacionesCuantitativasAsesorCampos({
  items,
  nombresCategoria,
  totalPares,
  elegidos,
  errorLista,
  mensajeEnvio,
  enviando,
  inputItemRef,
  onAgregar,
  onQuitar,
}: Props) {
  return (
    <>
      <FormSection titulo="Agregar valoración">
        <SelectorParEvaluacionCuantitativa
          items={items}
          nombresCategoria={nombresCategoria}
          onAgregar={onAgregar}
          deshabilitado={enviando}
          inputItemRef={inputItemRef}
          conObservacion={false}
        />
      </FormSection>
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
