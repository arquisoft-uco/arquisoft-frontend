import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
import { rolesDeUsuario } from '../../utils/roles-usuario';
import type { Usuario } from '../../models/Usuario';
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
} from '../../../../shared/validation';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';
import CampoTexto from './CampoTexto';

const schema = z
  .object({
    identificador: textoEntre(LIMITES.USUARIO_IDENTIFICADOR_MIN, LIMITES.USUARIO_IDENTIFICADOR_MAX),
    nombre: textoEntre(LIMITES.USUARIO_NOMBRE_MIN, LIMITES.USUARIO_NOMBRE_MAX),
    email: emailValido(LIMITES.USUARIO_EMAIL_MIN, LIMITES.USUARIO_EMAIL_MAX),
    contacto: soloDigitosEntre(LIMITES.USUARIO_CONTACTO_MIN, LIMITES.USUARIO_CONTACTO_MAX),
    roles: z.array(z.nativeEnum(Rol)),
  })
  .superRefine((val, ctx) => {
    if (!NOMBRE_COMPLETO_REGEX.test(val.nombre.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nombre'],
        message: MENSAJES_VALIDACION.formatoNombre,
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  usuario: Usuario;
  onCerrar: () => void;
}

export default function ModificarUsuarioForm({ usuario, onCerrar }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      identificador: usuario.identificador,
      nombre: usuario.nombre,
      email: usuario.email,
      contacto: usuario.contacto,
      roles: rolesDeUsuario(usuario),
    },
    mode: 'onChange',
    shouldUnregister: false,
  });

  const { mutate, isPending } = useModificarUsuario();

  const rolesAsignados = rolesDeUsuario(usuario);

  function onSubmit(values: FormValues) {
    mutate(
      {
        usuarioId: usuario.id,
        req: {
          identificador: values.identificador,
          nombre: values.nombre,
          email: values.email,
          contacto: values.contacto,
          roles: values.roles,
        },
      },
      {
        onSuccess: () => {
          toast.success('Usuario actualizado', `${values.nombre} fue actualizado correctamente.`);
          onCerrar();
        },
        onError: (err) => {
          // El toast es incondicional: el usuario debe enterarse del fallo aunque el
          // campo con el error quede fuera de la vista.
          toast.error(
            'Error al actualizar el usuario',
            getApiErrorMessage(err, 'Intenta nuevamente.'),
          );

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
            if (
              fe.field === 'identificador' ||
              fe.field === 'nombre' ||
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
      <h3 className="mb-4 text-base font-semibold text-on-surface">
        Editar usuario: {usuario.nombre}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} aria-busy={isPending} className="flex flex-col gap-4">
        <CampoTexto
          id="mu-identificador"
          etiqueta="Identificador"
          registro={register('identificador')}
          error={errors.identificador?.message}
        />

        <CampoTexto
          id="mu-nombre"
          etiqueta="Nombre"
          registro={register('nombre')}
          error={errors.nombre?.message}
        />

        <CampoTexto
          id="mu-email"
          etiqueta="Correo electrónico"
          type="email"
          registro={register('email')}
          error={errors.email?.message}
        />

        <CampoTexto
          id="mu-contacto"
          etiqueta="Contacto"
          inputMode="numeric"
          registro={register('contacto')}
          error={errors.contacto?.message}
        />

        <fieldset>
          <legend className="mb-1 text-xs font-medium text-on-surface-secondary">
            Roles (los ya asignados no se pueden quitar)
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.values(Rol).map((rol) => {
              const asignado = rolesAsignados.includes(rol);
              return (
                <label
                  key={rol}
                  className={[
                    'tap-target gap-2 text-sm text-on-surface',
                    asignado ? 'cursor-not-allowed opacity-60' : '',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    value={rol}
                    aria-disabled={asignado}
                    onClick={(evento) => {
                      // No usamos el atributo `disabled` nativo: react-hook-form devuelve
                      // `undefined` para un input deshabilitado, y el rol desaparecería del
                      // payload. En su lugar bloqueamos el toggle antes de que ocurra.
                      if (asignado) evento.preventDefault();
                    }}
                    className="checkbox-control rounded border-border text-primary focus:ring-primary"
                    {...register('roles')}
                  />
                  {ETIQUETAS_ROL[rol]}
                </label>
              );
            })}
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
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
