import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';
import FormSection from '../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../shared/validation';

export const ETIQUETAS_CAMPO = { nombre: 'Nombre', descripcion: 'Descripción' };

export interface RegistrarItemValues {
  nombre: string;
  descripcion: string;
}

interface Props {
  register: UseFormRegister<RegistrarItemValues>;
  errors: FieldErrors<RegistrarItemValues>;
  longitudes: RegistrarItemValues extends infer V ? { [K in keyof V]: number } : never;
}

export default function RegistrarItemCualitativoJuradoCampos({
  register,
  errors,
  longitudes,
}: Props) {
  return (
    <FormSection titulo="Datos del ítem">
      <Field
        etiqueta="Nombre"
        error={errors.nombre?.message}
        contador={{ actual: longitudes.nombre, max: LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX }}
      >
        {(control) => (
          <input
            {...control}
            type="text"
            maxLength={LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX}
            className="field-input"
            {...register('nombre')}
          />
        )}
      </Field>
      <Field
        etiqueta="Descripción"
        error={errors.descripcion?.message}
        contador={{ actual: longitudes.descripcion, max: LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX }}
      >
        {(control) => (
          <textarea
            {...control}
            rows={4}
            maxLength={LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX}
            className="field-input"
            {...register('descripcion')}
          />
        )}
      </Field>
    </FormSection>
  );
}
