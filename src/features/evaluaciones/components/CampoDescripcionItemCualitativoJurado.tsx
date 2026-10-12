import type { UseFormRegisterReturn } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';
import { LIMITES } from '../../../shared/validation';

interface Props {
  registro: UseFormRegisterReturn;
  longitud: number;
  error?: string;
}

export default function CampoDescripcionItemCualitativoJurado({
  registro,
  longitud,
  error,
}: Props) {
  return (
    <Field
      etiqueta="Descripción"
      error={error}
      contador={{ actual: longitud, max: LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX }}
    >
      {(control) => (
        <textarea
          {...control}
          rows={4}
          maxLength={LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX}
          className="field-input"
          {...registro}
        />
      )}
    </Field>
  );
}
