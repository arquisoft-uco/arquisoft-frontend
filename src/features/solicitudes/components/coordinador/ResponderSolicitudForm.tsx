import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useResponderSolicitudNovedadCoordinador } from '../../hooks/useResponderSolicitudNovedadCoordinador';
import type { Solicitud } from '../../models/Solicitud';

const schema = z.object({
  contenido: textoRequerido(LIMITES.RESPUESTA_CONTENIDO_MAX),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  solicitud: Solicitud;
  onCerrar: () => void;
}

export default function ResponderSolicitudForm({ solicitud, onCerrar }: Props) {
  const { mutate, isPending } = useResponderSolicitudNovedadCoordinador();

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contenido: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    setFocus('contenido');
  }, [setFocus]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onCerrar();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPending, onCerrar]);

  function onSubmit(values: FormValues) {
    mutate(
      { solicitudId: solicitud.id, contenido: values.contenido },
      {
        onSuccess: () => {
          toast.success('Respuesta enviada', `Se respondió la solicitud de ${solicitud.remitente.nombre}.`);
          onCerrar();
        },
        onError: (err) => {
          getApiFieldErrors(err).forEach((fieldError) => {
            if (fieldError.field === 'contenido') {
              setError('contenido', { message: fieldError.message });
            }
          });
          toast.error(
            'No se pudo enviar la respuesta',
            getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.'),
          );
        },
      },
    );
  }

  function handleBackdrop() {
    if (!isPending) onCerrar();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="responder-solicitud-titulo"
    >
      <div className="absolute inset-0 bg-black/40" onClick={handleBackdrop} aria-hidden="true" />

      <div className="relative z-10 flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-lg animate-fade-up">
        <h2 id="responder-solicitud-titulo" className="text-base font-semibold text-on-surface">
          Responder solicitud
        </h2>

        <div className="rounded-lg border border-border bg-surface-secondary p-3">
          <p className="text-sm font-medium text-on-surface">{solicitud.remitente.nombre}</p>
          <p className="mt-1 text-sm text-on-surface-secondary">{solicitud.mensajeSolicitud}</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="rs-contenido" className="field-label">
              Respuesta <span aria-hidden className="text-danger">*</span>
            </label>
            <textarea
              id="rs-contenido"
              rows={4}
              maxLength={LIMITES.RESPUESTA_CONTENIDO_MAX}
              className="field-input"
              aria-invalid={!!errors.contenido}
              aria-describedby={
                errors.contenido ? 'rs-contenido-error rs-contenido-ayuda' : 'rs-contenido-ayuda'
              }
              {...register('contenido')}
            />
            {errors.contenido && (
              <p id="rs-contenido-error" className="field-error" role="alert">
                {errors.contenido.message}
              </p>
            )}
            <p id="rs-contenido-ayuda" className="mt-1 text-xs text-on-surface-secondary">
              La respuesta es única para esta solicitud y no se puede editar después de enviarla.
            </p>
          </div>

          <div className="actions-row border-t border-border pt-4">
            <button
              type="button"
              onClick={onCerrar}
              disabled={isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Enviando...' : 'Enviar respuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
