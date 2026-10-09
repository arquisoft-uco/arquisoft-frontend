import { useId } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import Field, { type ControlDeCampo } from '../../../../shared/components/ui/Field';
import { RejillaDeCampos } from '../../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../../shared/validation';

export const ETIQUETA_NOMBRES = 'Nombres';
export const ETIQUETA_APELLIDOS = 'Apellidos';

const AYUDA_NOMBRES = `Nombres y apellidos juntos pueden tener hasta ${LIMITES.USUARIO_NOMBRE_MAX} caracteres.`;

type CampoDeNombre = 'nombres' | 'apellidos';

interface Props {
  register: (nombre: CampoDeNombre) => UseFormRegisterReturn;
  errors: Partial<Record<CampoDeNombre, { message?: string }>>;
}

export default function NombresApellidosCampos({ register, errors }: Props) {
  const idAyuda = useId();
  const describir = (control: ControlDeCampo) =>
    [control['aria-describedby'], idAyuda].filter(Boolean).join(' ');

  return (
    <div>
      <RejillaDeCampos>
        <Field etiqueta={ETIQUETA_NOMBRES} error={errors.nombres?.message}>
          {(control) => (
            <input
              className="field-input"
              {...control}
              aria-describedby={describir(control)}
              {...register('nombres')}
            />
          )}
        </Field>
        <Field etiqueta={ETIQUETA_APELLIDOS} error={errors.apellidos?.message}>
          {(control) => (
            <input
              className="field-input"
              {...control}
              aria-describedby={describir(control)}
              {...register('apellidos')}
            />
          )}
        </Field>
      </RejillaDeCampos>
      <p id={idAyuda} className="field-hint">
        {AYUDA_NOMBRES}
      </p>
    </div>
  );
}
