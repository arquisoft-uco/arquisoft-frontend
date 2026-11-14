import type { Ref } from 'react';
import ComboboxElegidos from '../../../../shared/components/ui/ComboboxElegidos';
import type { OpcionCombobox } from '../../../../shared/components/ui/Combobox';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import type { ItemCuantitativoJurado } from '../../models/ItemCuantitativoJurado';
import type { ObservacionPendienteEvaluacionCuantitativa } from '../../models/ObservacionPendienteEvaluacionCuantitativa';
import type { ParEvaluacionCuantitativaJurado } from '../../models/ParEvaluacionCuantitativaJurado';
import ObservacionesPendientesAviso from './ObservacionesPendientesAviso';
import SelectorParEvaluacionCuantitativa from './SelectorParEvaluacionCuantitativa';

const AYUDA = 'text-sm text-on-surface-secondary';

interface Props {
  items: ItemCuantitativoJurado[];
  nombresCategoria: ReadonlyMap<string, string>;
  totalPares: number;
  elegidos: OpcionCombobox[];
  errorLista?: string;
  mensajeEnvio: string;
  enviando: boolean;
  inputItemRef: Ref<HTMLInputElement>;
  onAgregar: (par: ParEvaluacionCuantitativaJurado) => void;
  onQuitar: (itemId: string) => void;
  pendientes: ObservacionPendienteEvaluacionCuantitativa[];
  nombresPorId: ReadonlyMap<string, string>;
  reintentando: boolean;
  onReintentar: () => void;
  onSalir: () => void;
}

export default function RegistrarEvaluacionesCuantitativasCampos({
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
  pendientes,
  nombresPorId,
  reintentando,
  onReintentar,
  onSalir,
}: Props) {
  if (pendientes.length > 0) {
    return (
      <ObservacionesPendientesAviso
        pendientes={pendientes}
        nombresPorId={nombresPorId}
        reintentando={reintentando}
        onReintentar={onReintentar}
        onSalir={onSalir}
      />
    );
  }
  return (
    <>
      <FormSection titulo="Agregar valoración">
        <SelectorParEvaluacionCuantitativa
          items={items}
          nombresCategoria={nombresCategoria}
          onAgregar={onAgregar}
          deshabilitado={enviando}
          inputItemRef={inputItemRef}
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
