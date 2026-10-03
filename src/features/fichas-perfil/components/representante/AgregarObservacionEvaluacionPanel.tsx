import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquarePlus } from 'lucide-react';
import { useAgregarObservacionEvaluacion } from '../../hooks/useAgregarObservacionEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';

const schema = z.object({
  observacion: textoRequerido(LIMITES.OBSERVACION_EVALUACION_MAX),
});

type FormValues = z.infer<typeof schema>;

const MENSAJE_FALLBACK = 'Ocurrió un error al agregar la observación. Intenta nuevamente.';

interface Props {
  evaluacionId: string;
}

export default function AgregarObservacionEvaluacionPanel({ evaluacionId }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { observacion: '' },
    mode: 'onChange',
  });

  const { mutate, reset: resetMutacion, isPending, isError, error } =
    useAgregarObservacionEvaluacion();

  const longitud = watch('observacion').length;

  function onSubmit({ observacion }: FormValues) {
    mutate(
      { evaluacionFichaPerfilId: evaluacionId, observacion },
      {
        onSuccess: () => {
          reset();
          resetMutacion();
          toast.success('Observación agregada', 'La observación quedó registrada en la evaluación.');
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, MENSAJE_FALLBACK);
          const errorDeCampo = getApiFieldErrors(err).find((e) => e.field === 'observacion');
          if (errorDeCampo) setError('observacion', { message: errorDeCampo.message });
          toast.error('No se pudo agregar la observación', mensaje);
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-xl border border-border bg-surface p-4 space-y-3 animate-fade-up"
    >
      <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
        <MessageSquarePlus size={16} className="text-primary" aria-hidden />
        Agregar observación
      </h4>

      <div>
        <label htmlFor="observacion-evaluacion" className="field-label">
          Observación
        </label>
        <textarea
          id="observacion-evaluacion"
          rows={4}
          maxLength={LIMITES.OBSERVACION_EVALUACION_MAX}
          aria-invalid={!!errors.observacion}
          aria-describedby={
            errors.observacion ? 'observacion-evaluacion-error' : 'observacion-evaluacion-contador'
          }
          className="field-input"
          {...register('observacion')}
        />
        <div className="mt-1 flex items-start justify-between gap-2">
          {errors.observacion ? (
            <p id="observacion-evaluacion-error" className="field-error" role="alert">
              {errors.observacion.message}
            </p>
          ) : (
            <span />
          )}
          <span
            id="observacion-evaluacion-contador"
            className="text-xs text-on-surface-secondary shrink-0"
          >
            {longitud}/{LIMITES.OBSERVACION_EVALUACION_MAX}
          </span>
        </div>
      </div>

      {isError && (
        <p className="text-sm text-danger" role="alert">
          {getApiErrorMessage(error, MENSAJE_FALLBACK)}
        </p>
      )}

      <div className="actions-row">
        <button
          type="submit"
          disabled={!isValid || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          <MessageSquarePlus size={15} aria-hidden />
          {isPending ? 'Agregando...' : 'Agregar observación'}
        </button>
      </div>
    </form>
  );
}
