import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useModificarObservacionEvaluacion } from '../../hooks/useModificarObservacionEvaluacion';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';

const schema = z.object({
  observacion: textoRequerido(LIMITES.OBSERVACION_EVALUACION_MAX),
});

type FormValues = z.infer<typeof schema>;

const ID_FORMULARIO = 'editar-observacion-evaluacion';
const ETIQUETAS = { observacion: 'Observación' };
const MENSAJE_FALLBACK = 'No se pudo actualizar la observación. Intenta nuevamente.';

interface Props {
  observacion: ObservacionEvaluacion;
  fichaPerfilId: string;
  onCerrar: () => void;
}

export default function EditarObservacionEvaluacionForm({
  observacion,
  fichaPerfilId,
  onCerrar,
}: Props) {
  const {
    mutate,
    reset: resetMutacion,
    isPending,
  } = useModificarObservacionEvaluacion(fichaPerfilId, observacion.evaluacionFichaPerfilId);
  const [resumenVisible, setResumenVisible] = useState(false);
  const formulario = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { observacion: observacion.observacion },
    mode: 'onTouched',
  });
  const { register, setError, setFocus, watch } = formulario;
  const { errors, isDirty } = formulario.formState;
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS) : [];

  function cerrar() {
    formulario.reset();
    resetMutacion();
    onCerrar();
  }

  function enviar(values: FormValues) {
    mutate(
      { observacionEvaluacionId: observacion.id, observacion: values.observacion },
      {
        onSuccess: () => {
          toast.success('Observación actualizada', 'El texto se guardó correctamente.');
          cerrar();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, MENSAJE_FALLBACK);
          toast.error('No se pudo actualizar la observación', mensaje);
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'observacion');
          if (delCampo) {
            setError('observacion', { message: delCampo.message });
          } else if (hasApiErrorCode(err, 'OBSERVACION_EVALUACION_DUPLICADA')) {
            setError('observacion', { message: mensaje });
          }
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Editar observación"
      sucio={isDirty}
      ocupado={isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Guardar cambios"
          accionEnviando="Guardando…"
          enviando={isPending}
          sucio={isDirty}
          sinCambios={!isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        noValidate
        aria-busy={isPending}
        onSubmit={formulario.handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-5"
      >
        <Field
          etiqueta="Observación"
          error={errors.observacion?.message}
          contador={{
            actual: watch('observacion').length,
            max: LIMITES.OBSERVACION_EVALUACION_MAX,
          }}
        >
          {(control) => (
            <textarea
              rows={6}
              maxLength={LIMITES.OBSERVACION_EVALUACION_MAX}
              className="field-input"
              {...register('observacion')}
              {...control}
            />
          )}
        </Field>
        <ErrorSummary errores={errores} onIrAlCampo={() => setFocus('observacion')} />
      </form>
    </SidePanel>
  );
}
