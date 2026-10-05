import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquarePlus } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useAgregarObservacionEvaluacion } from '../../hooks/useAgregarObservacionEvaluacion';

const schema = z.object({
  observacion: textoRequerido(LIMITES.OBSERVACION_EVALUACION_MAX),
});

type FormValues = z.infer<typeof schema>;

const MENSAJE_FALLBACK = 'Ocurrió un error al agregar la observación. Intenta nuevamente.';
const ETIQUETAS = { observacion: 'Observación' };
const TARJETA =
  'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 animate-fade-up';
const TITULO = 'flex items-center gap-2 text-sm font-semibold text-on-surface';

interface Props {
  evaluacionId: string;
}

export default function AgregarObservacionEvaluacionPanel({ evaluacionId }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { observacion: '' },
    mode: 'onTouched',
  });

  const { mutate, reset: resetMutacion, isPending } = useAgregarObservacionEvaluacion();

  const longitud = watch('observacion').length;

  function onSubmit({ observacion }: FormValues) {
    mutate(
      { evaluacionFichaPerfilId: evaluacionId, observacion },
      {
        onSuccess: () => {
          reset();
          resetMutacion();
          toast.success(
            'Observación agregada',
            'La observación quedó registrada en la evaluación.',
          );
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={TARJETA}>
      <h4 className={TITULO}>
        <MessageSquarePlus size={16} className="text-primary" aria-hidden />
        Agregar observación
      </h4>

      {isSubmitted && (
        <ErrorSummary
          errores={resumirErrores(errors, ETIQUETAS)}
          onIrAlCampo={() => setFocus('observacion')}
        />
      )}

      <Field
        etiqueta="Observación"
        error={errors.observacion?.message}
        contador={{ actual: longitud, max: LIMITES.OBSERVACION_EVALUACION_MAX }}
      >
        {(control) => (
          <textarea
            {...control}
            rows={4}
            maxLength={LIMITES.OBSERVACION_EVALUACION_MAX}
            className="field-input"
            {...register('observacion')}
          />
        )}
      </Field>

      <div className="actions-row">
        <Button type="submit" icono={MessageSquarePlus} cargando={isPending}>
          {isPending ? 'Agregando...' : 'Agregar observación'}
        </Button>
      </div>
    </form>
  );
}
