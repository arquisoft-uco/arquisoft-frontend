import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEnviarSolicitudNovedadCoordinador } from '../../hooks/useEnviarSolicitudNovedadCoordinador';
import { toast } from '../../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido, uuidValido } from '../../../../shared/validation';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import Field from '../../../../shared/components/ui/Field';

const schema = z.object({
  destinatario: uuidValido(),
  mensajeSolicitud: textoRequerido(LIMITES.MENSAJE_SOLICITUD_MAX),
});

type FormValues = z.infer<typeof schema>;

function esCampoDelFormulario(campo: string): campo is keyof FormValues {
  return campo === 'destinatario' || campo === 'mensajeSolicitud';
}

export default function EnviarSolicitudNovedadForm() {
  const [confirmando, setConfirmando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { destinatario: '', mensajeSolicitud: '' },
    mode: 'onChange',
  });

  const { mutate, isPending, reset: resetMutation } = useEnviarSolicitudNovedadCoordinador();

  function onSubmit(values: FormValues) {
    mutate(
      { destinatario: values.destinatario, mensajeSolicitud: values.mensajeSolicitud },
      {
        onSuccess: () => {
          toast.success('Solicitud enviada', 'El coordinador recibirá tu mensaje.');
          reset();
          resetMutation();
          setConfirmando(false);
        },
        onError: (err) => {
          // El toast es incondicional: el usuario debe enterarse del fallo aunque el
          // campo con el error quede fuera de la vista.
          toast.error(
            'No se pudo enviar la solicitud',
            getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.'),
          );

          if (
            hasApiErrorCode(err, 'DESTINATARIO_NO_ENCONTRADO') ||
            hasApiErrorCode(err, 'DESTINATARIO_NO_ASIGNADO')
          ) {
            setError('destinatario', {
              message: getApiErrorMessage(err, 'El destinatario indicado no es válido.'),
            });
          }

          getApiFieldErrors(err).forEach((fieldError) => {
            if (esCampoDelFormulario(fieldError.field)) {
              setError(fieldError.field, { message: fieldError.message });
            }
          });

          setConfirmando(false);
        },
      },
    );
  }

  function handleSubmitNativo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isValid) setConfirmando(true);
  }

  function handleCancelarConfirmacion() {
    setConfirmando(false);
  }

  function handleConfirmar() {
    handleSubmit(onSubmit)();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 text-base font-semibold text-on-surface">
        Enviar solicitud de novedad al coordinador
      </h3>

      <form className="flex flex-col gap-4" onSubmit={handleSubmitNativo} aria-busy={isPending}>
        <div>
          <Field
            etiqueta="Destinatario (UUID del coordinador)"
            error={errors.destinatario?.message}
          >
            {(control) => (
              <input
                type="text"
                className="field-input"
                placeholder="Ej. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                {...register('destinatario')}
                {...control}
              />
            )}
          </Field>
          <div className="mt-2">
            <AvisoNoDisponible recurso="coordinadores" />
          </div>
        </div>

        <Field etiqueta="Mensaje" error={errors.mensajeSolicitud?.message}>
          {(control) => (
            <textarea
              rows={4}
              maxLength={LIMITES.MENSAJE_SOLICITUD_MAX}
              className="field-input"
              placeholder="Describe la novedad que quieres reportar al coordinador"
              {...register('mensajeSolicitud')}
              {...control}
            />
          )}
        </Field>

        <div className="actions-row border-t border-border pt-4">
          <Button type="submit" disabled={!isValid} cargando={isPending}>
            {isPending ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
        </div>
      </form>

      {confirmando && (
        <ConfirmDialog
          titulo="Enviar solicitud al coordinador"
          descripcion="Se enviará un mensaje de novedad al coordinador indicado. ¿Deseas continuar?"
          labelConfirmar="Enviar"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={handleConfirmar}
          onCancelar={handleCancelarConfirmacion}
        />
      )}
    </div>
  );
}
