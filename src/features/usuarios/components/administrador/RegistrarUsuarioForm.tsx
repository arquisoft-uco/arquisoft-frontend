import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistrarUsuario } from '../../hooks/useRegistrarUsuario';
import { toast } from '../../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import {
  LIMITES,
  MENSAJES_VALIDACION,
  NOMBRE_COMPLETO_REGEX,
  emailValido,
  soloDigitosEntre,
  textoEntre,
  textoNoVacio,
} from '../../../../shared/validation';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';
import CampoTexto from './CampoTexto';

const schema = z
  .object({
    identificador: textoEntre(LIMITES.USUARIO_IDENTIFICADOR_MIN, LIMITES.USUARIO_IDENTIFICADOR_MAX),
    nombres: textoNoVacio(),
    apellidos: textoNoVacio(),
    email: emailValido(LIMITES.USUARIO_EMAIL_MIN, LIMITES.USUARIO_EMAIL_MAX),
    contacto: soloDigitosEntre(LIMITES.USUARIO_CONTACTO_MIN, LIMITES.USUARIO_CONTACTO_MAX),
    roles: z.array(z.nativeEnum(Rol)).optional(),
  })
  .superRefine((val, ctx) => {
    const nombres = val.nombres.trim();
    const apellidos = val.apellidos.trim();

    if (!NOMBRE_COMPLETO_REGEX.test(nombres)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nombres'],
        message: MENSAJES_VALIDACION.formatoNombre,
      });
    }
    if (!NOMBRE_COMPLETO_REGEX.test(apellidos)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['apellidos'],
        message: MENSAJES_VALIDACION.formatoNombre,
      });
    }

    const longitud = `${nombres} ${apellidos}`.length;
    if (longitud < LIMITES.USUARIO_NOMBRE_MIN || longitud > LIMITES.USUARIO_NOMBRE_MAX) {
      const mensaje = MENSAJES_VALIDACION.longitudEntre(
        LIMITES.USUARIO_NOMBRE_MIN,
        LIMITES.USUARIO_NOMBRE_MAX,
      );
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombres'], message: mensaje });
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['apellidos'], message: mensaje });
    }
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  onCerrar: () => void;
}

export default function RegistrarUsuarioForm({ onCerrar }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      identificador: '',
      nombres: '',
      apellidos: '',
      email: '',
      contacto: '',
      roles: [],
    },
    mode: 'onChange',
  });

  const { mutate, isPending } = useRegistrarUsuario();

  function onSubmit(values: FormValues) {
    mutate(
      {
        identificador: values.identificador,
        nombres: values.nombres,
        apellidos: values.apellidos,
        email: values.email,
        contacto: values.contacto,
        roles: values.roles,
      },
      {
        onSuccess: () => {
          toast.success(
            'Usuario registrado',
            `${values.nombres} ${values.apellidos} fue registrado correctamente.`,
          );
          onCerrar();
        },
        onError: (err) => {
          // El toast es incondicional: el usuario debe enterarse del fallo aunque el
          // campo con el error quede fuera de la vista.
          toast.error('Error al registrar el usuario', getApiErrorMessage(err, 'Intenta nuevamente.'));

          if (hasApiErrorCode(err, 'USUARIO_IDENTIFICADOR_DUPLICADO')) {
            setError('identificador', {
              message: getApiErrorMessage(err, 'Ya existe un usuario con este identificador.'),
            });
          } else if (hasApiErrorCode(err, 'USUARIO_EMAIL_DUPLICADO')) {
            setError('email', {
              message: getApiErrorMessage(err, 'Ya existe un usuario con este correo.'),
            });
          } else if (hasApiErrorCode(err, 'USUARIO_CONTACTO_DUPLICADO')) {
            setError('contacto', {
              message: getApiErrorMessage(err, 'Ya existe un usuario con este contacto.'),
            });
          }

          // Caso residual: fieldErrors del backend que el cliente no debería producir
          // (ya replica la regla), pero el backend es la autoridad final.
          getApiFieldErrors(err).forEach((fe) => {
            if (fe.field === 'nombre') {
              setError('nombres', { message: fe.message });
              setError('apellidos', { message: fe.message });
            } else if (
              fe.field === 'identificador' ||
              fe.field === 'nombres' ||
              fe.field === 'apellidos' ||
              fe.field === 'email' ||
              fe.field === 'contacto' ||
              fe.field === 'roles'
            ) {
              setError(fe.field, { message: fe.message });
            }
          });
        },
      },
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 text-base font-semibold text-on-surface">Registrar nuevo usuario</h3>

      <form onSubmit={handleSubmit(onSubmit)} aria-busy={isPending} className="flex flex-col gap-4">
        <CampoTexto
          id="us-identificador"
          etiqueta="Identificador"
          registro={register('identificador')}
          error={errors.identificador?.message}
        />

        <CampoTexto
          id="us-nombres"
          etiqueta="Nombres"
          registro={register('nombres', { deps: 'apellidos' })}
          error={errors.nombres?.message}
        />

        <CampoTexto
          id="us-apellidos"
          etiqueta="Apellidos"
          registro={register('apellidos', { deps: 'nombres' })}
          error={errors.apellidos?.message}
        />

        <CampoTexto
          id="us-email"
          etiqueta="Correo electrónico"
          type="email"
          registro={register('email')}
          error={errors.email?.message}
        />

        <CampoTexto
          id="us-contacto"
          etiqueta="Contacto"
          inputMode="numeric"
          registro={register('contacto')}
          error={errors.contacto?.message}
        />

        <fieldset>
          <legend className="mb-1 text-xs font-medium text-on-surface-secondary">
            Roles a asignar (opcional)
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.values(Rol).map((rol) => (
              <label key={rol} className="tap-target gap-2 text-sm text-on-surface">
                <input
                  type="checkbox"
                  value={rol}
                  className="checkbox-control rounded border-border text-primary focus:ring-primary"
                  {...register('roles')}
                />
                {ETIQUETAS_ROL[rol]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="actions-row border-t border-border pt-4">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-on-surface transition-colors hover:bg-muted sm:py-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || !isValid}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:py-2"
          >
            {isPending ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
