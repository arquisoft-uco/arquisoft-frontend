import type { UseQueryResult } from '@tanstack/react-query';
import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import ErrorSummary, { type ErrorDeCampo } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import type { IdentidadUsuario } from '../../models/IdentidadUsuario';
import type { EditarUsuarioValues } from '../../utils/editar-usuario-schema';
import NombresApellidosCampos, {
  ETIQUETA_APELLIDOS,
  ETIQUETA_NOMBRES,
} from './NombresApellidosCampos';

export const ETIQUETAS_CAMPO = {
  identificador: 'Identificador',
  nombres: ETIQUETA_NOMBRES,
  apellidos: ETIQUETA_APELLIDOS,
  email: 'Correo electrónico',
  contacto: 'Contacto',
} as const;

const FORMULARIO = 'flex flex-col gap-4';
const FRASE = 'text-sm text-on-surface-secondary';

interface Props {
  consulta: UseQueryResult<IdentidadUsuario>;
  formId: string;
  register: UseFormRegister<EditarUsuarioValues>;
  errors: FieldErrors<EditarUsuarioValues>;
  enviando: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  resumen: ErrorDeCampo[];
  onIrAlCampo: (campo: string) => void;
}

export default function EditarUsuarioDatos({
  consulta,
  formId,
  register,
  errors,
  enviando,
  onSubmit,
  resumen,
  onIrAlCampo,
}: Props) {
  if (consulta.isPending) {
    return <Skeleton variante="formulario" etiqueta="Cargando datos del usuario" />;
  }
  if (consulta.isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los datos del usuario"
        detalle={getApiErrorMessage(consulta.error, 'Inténtalo nuevamente.')}
        onReintentar={() => consulta.refetch()}
      />
    );
  }

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
      <NombresApellidosCampos register={register} errors={errors} />
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
