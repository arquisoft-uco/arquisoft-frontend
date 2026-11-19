import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useRegistrarObservacionItemAsesor } from '../../hooks/useRegistrarObservacionItemAsesor';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import { OBSERVACION_ITEM_ASESOR_DESCRIPCION_DUPLICADA } from '../../utils/codigos-error-evaluaciones';
import { cierraPanelRegistrarObservacionItemAsesor } from '../../utils/errores-registro-observacion-item-asesor';

const ID_FORMULARIO = 'registrar-observacion-item-asesor';
const ETIQUETAS_CAMPO = { descripcion: 'Observación' };

const schema = z.object({
  descripcion: textoRequerido(LIMITES.OBSERVACION_ITEM_ASESOR_DESCRIPCION_MAX),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  evaluacion: EvaluacionCuantitativaAsesor;
  onCerrar: () => void;
}

export default function RegistrarObservacionItemAsesorPanel({ evaluacion, onCerrar }: Props) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { descripcion: '' },
    mode: 'onTouched',
  });

  const descripcion = useWatch({ control, name: 'descripcion' });
  const { mutate, isPending, reset: resetMutation } = useRegistrarObservacionItemAsesor();
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function enviar(values: FormValues) {
    mutate(
      { evaluacionCuantitativaAsesorId: evaluacion.id, descripcion: values.descripcion },
      {
        onSuccess: () => {
          toast.success('Observación registrada', 'La observación se guardó correctamente.');
          cerrar();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, 'No se pudo registrar la observación.');
          toast.error('No se pudo registrar la observación', mensaje);

          if (cierraPanelRegistrarObservacionItemAsesor(err)) {
            cerrar();
            return;
          }
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'descripcion');
          if (delCampo) {
            setError('descripcion', { message: delCampo.message });
          } else if (hasApiErrorCode(err, OBSERVACION_ITEM_ASESOR_DESCRIPCION_DUPLICADA)) {
            setError('descripcion', { message: mensaje });
          }
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Registrar observación"
      descripcion={evaluacion.item.nombre}
      sucio={isDirty}
      ocupado={isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Registrar observación"
          accionEnviando="Registrando…"
          enviando={isPending}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Registro de observación"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-5"
      >
        <Field
          etiqueta={ETIQUETAS_CAMPO.descripcion}
          error={errors.descripcion?.message}
          contador={{
            actual: descripcion.length,
            max: LIMITES.OBSERVACION_ITEM_ASESOR_DESCRIPCION_MAX,
          }}
        >
          {(campo) => (
            <textarea
              {...campo}
              rows={6}
              maxLength={LIMITES.OBSERVACION_ITEM_ASESOR_DESCRIPCION_MAX}
              className="field-input"
              {...register('descripcion')}
            />
          )}
        </Field>
        <ErrorSummary errores={errores} onIrAlCampo={() => setFocus('descripcion')} />
      </form>
    </SidePanel>
  );
}
