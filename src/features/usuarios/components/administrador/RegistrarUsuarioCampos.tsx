import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import Field from '../../../../shared/components/ui/Field';
import FilterChip from '../../../../shared/components/ui/FilterChip';
import FormSection from '../../../../shared/components/ui/FormSection';
import { ETIQUETAS_ROL, type Rol } from '../../../../shared/models/rol';
import { LIMITES } from '../../../../shared/validation';
import type { RegistrarUsuarioValues } from '../../utils/registrar-usuario-schema';
import { ROLES_REGISTRABLES } from '../../utils/roles-usuario';
import NombresApellidosCampos, {
  ETIQUETA_APELLIDOS,
  ETIQUETA_NOMBRES,
} from './NombresApellidosCampos';

export const ETIQUETAS_CAMPO = {
  identificador: 'Identificador',
  email: 'Correo electrónico',
  nombres: ETIQUETA_NOMBRES,
  apellidos: ETIQUETA_APELLIDOS,
  contacto: 'Contacto',
} as const;

const AYUDA_IDENTIFICADOR = `De ${LIMITES.USUARIO_IDENTIFICADOR_MIN} a ${LIMITES.USUARIO_IDENTIFICADOR_MAX} caracteres. No se puede repetir.`;
const AYUDA_EMAIL = 'No se puede repetir.';
const AYUDA_CONTACTO = `Entre ${LIMITES.USUARIO_CONTACTO_MIN} y ${LIMITES.USUARIO_CONTACTO_MAX} dígitos.`;
const DESCRIPCION_ROLES = 'Puedes cambiarlos después desde la edición del usuario.';
const CHIPS = 'flex flex-wrap gap-2';

interface Props {
  register: UseFormRegister<RegistrarUsuarioValues>;
  errors: FieldErrors<RegistrarUsuarioValues>;
  rolesSeleccionados: Rol[];
  onAlternarRol: (rol: Rol) => void;
}

export default function RegistrarUsuarioCampos({
  register,
  errors,
  rolesSeleccionados,
  onAlternarRol,
}: Props) {
  return (
    <>
      <FormSection titulo="Cuenta">
        <Field
          etiqueta={ETIQUETAS_CAMPO.identificador}
          corto
          ayuda={AYUDA_IDENTIFICADOR}
          error={errors.identificador?.message}
        >
          {(control) => (
            <input className="field-input" {...control} {...register('identificador')} />
          )}
        </Field>
        <Field etiqueta={ETIQUETAS_CAMPO.email} ayuda={AYUDA_EMAIL} error={errors.email?.message}>
          {(control) => (
            <input className="field-input" type="email" {...control} {...register('email')} />
          )}
        </Field>
      </FormSection>

      <FormSection titulo="Datos personales">
        <NombresApellidosCampos register={register} errors={errors} />
        <Field
          etiqueta={ETIQUETAS_CAMPO.contacto}
          corto
          ayuda={AYUDA_CONTACTO}
          error={errors.contacto?.message}
        >
          {(control) => (
            <input
              className="field-input"
              inputMode="numeric"
              {...control}
              {...register('contacto')}
            />
          )}
        </Field>
      </FormSection>

      <FormSection titulo="Roles" opcional descripcion={DESCRIPCION_ROLES}>
        <div role="group" aria-label="Roles iniciales" className={CHIPS}>
          {ROLES_REGISTRABLES.map((rol) => (
            <FilterChip
              key={rol}
              etiqueta={ETIQUETAS_ROL[rol]}
              activo={rolesSeleccionados.includes(rol)}
              onClick={() => onAlternarRol(rol)}
            />
          ))}
        </div>
      </FormSection>
    </>
  );
}
