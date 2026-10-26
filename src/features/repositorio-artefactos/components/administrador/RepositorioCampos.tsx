import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../../shared/validation';
import { ETIQUETAS_CAMPO } from '../../utils/repositorio-schema';
import type { RepositorioValues } from '../../utils/repositorio-schema';

interface Props {
  register: UseFormRegister<RepositorioValues>;
  errors: FieldErrors<RepositorioValues>;
  longitudNombre: number;
  longitudDescripcion: number;
}

export default function RepositorioCampos({
  register,
  errors,
  longitudNombre,
  longitudDescripcion,
}: Props) {
  return (
    <FormSection titulo="Datos del repositorio">
      <Field
        etiqueta={ETIQUETAS_CAMPO.nombreRepositorio}
        error={errors.nombreRepositorio?.message}
        contador={{ actual: longitudNombre, max: LIMITES.REPOSITORIO_NOMBRE_MAX }}
      >
        {(control) => (
          <input
            className="field-input"
            maxLength={LIMITES.REPOSITORIO_NOMBRE_MAX}
            {...control}
            {...register('nombreRepositorio')}
          />
        )}
      </Field>
      <Field
        etiqueta={ETIQUETAS_CAMPO.descripcion}
        error={errors.descripcion?.message}
        contador={{ actual: longitudDescripcion, max: LIMITES.REPOSITORIO_DESCRIPCION_MAX }}
      >
        {(control) => (
          <textarea
            rows={4}
            className="field-input"
            maxLength={LIMITES.REPOSITORIO_DESCRIPCION_MAX}
            {...control}
            {...register('descripcion')}
          />
        )}
      </Field>
    </FormSection>
  );
}
