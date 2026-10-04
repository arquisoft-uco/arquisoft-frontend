import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import ErrorSummary, { type ErrorDeCampo } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import type { EditarUsuarioValues } from '../../utils/editar-usuario-schema';

export const ETIQUETAS_CAMPO = {
  identificador: 'Identificador',
  nombre: 'Nombre completo',
  email: 'Correo electrónico',
  contacto: 'Contacto',
} as const;

const FORMULARIO = 'flex flex-col gap-4';
const FRASE = 'text-sm text-on-surface-secondary';

interface Props {
  formId: string;
  register: UseFormRegister<EditarUsuarioValues>;
  errors: FieldErrors<EditarUsuarioValues>;
  enviando: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  resumen: ErrorDeCampo[];
  onIrAlCampo: (campo: string) => void;
}

export default function EditarUsuarioDatos({
  formId,
  register,
  errors,
  enviando,
  onSubmit,
  resumen,
  onIrAlCampo,
}: Props) {
  return (
    <form
      id={formId}
      aria-label="Datos del usuario"
      noValidate
      aria-busy={enviando}
      onSubmit={onSubmit}
      className={FORMULARIO}
    >
      <p className={FRASE}>Los cambios de esta pestaña se guardan al pulsar «Guardar cambios».</p>
      <Field etiqueta={ETIQUETAS_CAMPO.identificador} corto error={errors.identificador?.message}>
        {(control) => <input className="field-input" {...control} {...register('identificador')} />}
      </Field>
      <Field etiqueta={ETIQUETAS_CAMPO.nombre} error={errors.nombre?.message}>
        {(control) => <input className="field-input" {...control} {...register('nombre')} />}
      </Field>
      <Field etiqueta={ETIQUETAS_CAMPO.email} error={errors.email?.message}>
        {(control) => (
          <input className="field-input" type="email" {...control} {...register('email')} />
        )}
      </Field>
      <Field etiqueta={ETIQUETAS_CAMPO.contacto} corto error={errors.contacto?.message}>
        {(control) => (
          <input
            className="field-input"
            inputMode="numeric"
            {...control}
            {...register('contacto')}
          />
        )}
      </Field>
      <ErrorSummary errores={resumen} onIrAlCampo={onIrAlCampo} />
    </form>
  );
}
