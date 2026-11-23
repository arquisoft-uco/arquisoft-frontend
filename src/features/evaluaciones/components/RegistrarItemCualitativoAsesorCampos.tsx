import { useWatch } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';
import FormSection from '../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../shared/validation';
import CampoPesoItemCualitativo from './CampoPesoItemCualitativo';
import type { RegistrarItemCualitativoAsesorValues as Values } from '../utils/registrar-item-cualitativo-asesor-schema';

export const ETIQUETAS_CAMPO = {
  nombre: 'Nombre',
  descripcion: 'Descripción',
  peso: 'Peso',
} as const;

interface Props {
  register: UseFormRegister<Values>;
  errors: FieldErrors<Values>;
  controlFormulario: Control<Values>;
}

export default function RegistrarItemCualitativoAsesorCampos({
  register,
  errors,
  controlFormulario,
}: Props) {
  const [nombre, descripcion] = useWatch({
    control: controlFormulario,
    name: ['nombre', 'descripcion'],
  });

  return (
    <FormSection titulo="Datos del ítem">
      <Field
        etiqueta={ETIQUETAS_CAMPO.nombre}
        error={errors.nombre?.message}
        contador={{ actual: nombre.length, max: LIMITES.ITEM_CUALITATIVO_ASESOR_NOMBRE_MAX }}
      >
        {(control) => (
          <input
            {...control}
            type="text"
            maxLength={LIMITES.ITEM_CUALITATIVO_ASESOR_NOMBRE_MAX}
            className="field-input"
            {...register('nombre')}
          />
        )}
      </Field>
      <Field
        etiqueta={ETIQUETAS_CAMPO.descripcion}
        error={errors.descripcion?.message}
        contador={{
          actual: descripcion.length,
          max: LIMITES.ITEM_CUALITATIVO_ASESOR_DESCRIPCION_MAX,
        }}
      >
        {(control) => (
          <textarea
            {...control}
            rows={4}
            maxLength={LIMITES.ITEM_CUALITATIVO_ASESOR_DESCRIPCION_MAX}
            className="field-input"
            {...register('descripcion')}
          />
        )}
      </Field>
      <CampoPesoItemCualitativo
        registro={register('peso')}
        min={LIMITES.ITEM_CUALITATIVO_ASESOR_PESO_MIN}
        max={LIMITES.ITEM_CUALITATIVO_ASESOR_PESO_MAX}
        error={errors.peso?.message}
      />
    </FormSection>
  );
}
