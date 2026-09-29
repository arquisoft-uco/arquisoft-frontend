import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEnviarSolicitudNovedadCoordinador } from '../../hooks/useEnviarSolicitudNovedadCoordinador';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido, uuidValido } from '../../../../shared/validation';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

const schema = z.object({
  destinatario: uuidValido(),
  mensajeSolicitud: textoRequerido(LIMITES.MENSAJE_SOLICITUD_MAX),
});

type FormValues = z.infer<typeof schema>;

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
          getApiFieldErrors(err).forEach((fieldError) => {
            setError(fieldError.field as keyof FormValues, { message: fieldError.message });
          });
          if (
            hasApiErrorCode(err, 'DESTINATARIO_NO_ENCONTRADO') ||
            hasApiErrorCode(err, 'DESTINATARIO_NO_ASIGNADO')
          ) {
            setError('destinatario', {
              message: getApiErrorMessage(err, 'El destinatario indicado no es válido.'),
            });
          }
          toast.error(
            'No se pudo enviar la solicitud',
            getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.'),
          );
          setConfirmando(false);
        },
      },
    );
  }

  function handleAbrirConfirmacion() {
    setConfirmando(true);
  }

  function handleCancelarConfirmacion() {
    setConfirmando(false);
  }

  function handleConfirmar() {
    handleSubmit(onSubmit)();
  }

  function handleSubmitNativo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-on-surface">
        Enviar solicitud de novedad al coordinador
      </h3>

      <form className="flex flex-col gap-4" onSubmit={handleSubmitNativo}>
        {/* Destinatario */}
        <div>
          <label
            htmlFor="sn-destinatario"
            className="mb-1 block text-xs font-medium text-on-surface-secondary"
          >
            Destinatario (UUID del coordinador) <span aria-hidden className="text-danger">*</span>
          </label>
          <input
            id="sn-destinatario"
            type="text"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-danger"
            aria-invalid={!!errors.destinatario}
            aria-describedby={errors.destinatario ? 'sn-destinatario-error' : undefined}
            placeholder="Ej. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            {...register('destinatario')}
          />
          {errors.destinatario && (
            <p id="sn-destinatario-error" className="mt-1 text-xs text-danger" role="alert">
              {errors.destinatario.message}
            </p>
          )}
          <div className="mt-2">
            <AvisoNoDisponible recurso="coordinadores" />
          </div>
        </div>

        {/* Mensaje */}
        <div>
          <label
            htmlFor="sn-mensaje"
            className="mb-1 block text-xs font-medium text-on-surface-secondary"
          >
            Mensaje <span aria-hidden className="text-danger">*</span>
          </label>
          <textarea
            id="sn-mensaje"
            rows={4}
            maxLength={LIMITES.MENSAJE_SOLICITUD_MAX}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-danger"
            aria-invalid={!!errors.mensajeSolicitud}
            aria-describedby={errors.mensajeSolicitud ? 'sn-mensaje-error' : undefined}
            placeholder="Describe la novedad que quieres reportar al coordinador"
            {...register('mensajeSolicitud')}
          />
          {errors.mensajeSolicitud && (
            <p id="sn-mensaje-error" className="mt-1 text-xs text-danger" role="alert">
              {errors.mensajeSolicitud.message}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="button"
            onClick={handleAbrirConfirmacion}
            disabled={!isValid || isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Enviando...' : 'Enviar solicitud'}
          </button>
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
