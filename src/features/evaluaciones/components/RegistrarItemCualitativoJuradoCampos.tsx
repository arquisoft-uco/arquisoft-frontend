import { useWatch } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';
import FormSection from '../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../shared/validation';
import type { RegistrarItemCualitativoJuradoValues as Values } from '../utils/registrar-item-cualitativo-jurado-schema';

export const ETIQUETAS_CAMPO = { nombre: 'Nombre', descripcion: 'Descripción' } as const;

interface Props {
  register: UseFormRegister<Values>;
  errors: FieldErrors<Values>;
  controlFormulario: Control<Values>;
}

export default function RegistrarItemCualitativoJuradoCampos({
  register,
  errors,
  controlFormulario,
}: Props) {
  const [nombre, descripcion] = useWatch({
    control: controlFormulario,
    name: ['nombre', 'descripcion'],
  });
  const longitudes: Record<keyof Values, number> = {
    nombre: nombre.length,
    descripcion: descripcion.length,
  };

  return (
    <FormSection titulo="Datos del ítem">
      <Field
        etiqueta={ETIQUETAS_CAMPO.nombre}
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
        etiqueta={ETIQUETAS_CAMPO.descripcion}
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
