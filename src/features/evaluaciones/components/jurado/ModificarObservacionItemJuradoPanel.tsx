import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../../shared/validation';
import { useModificarObservacionItemJurado } from '../../hooks/useModificarObservacionItemJurado';
import type { ObservacionItemJurado } from '../../models/ObservacionItemJurado';
import {
  OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA,
  OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA,
  OBSERVACION_ITEM_JURADO_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';
import { mensajeErrorModificarObservacionItemJurado } from '../../utils/errores-modificar-observacion-item-jurado';

const ID_FORMULARIO = 'modificar-observacion-item-jurado';
const ETIQUETAS_CAMPO = { descripcion: 'Observación' };
const CODIGOS_QUE_CIERRAN = [
  OBSERVACION_ITEM_JURADO_NO_ENCONTRADA,
  OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA,
];

const schema = z.object({
  descripcion: textoRequerido(LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  observacion: ObservacionItemJurado;
  nombreItem: string;
  onCerrar: () => void;
}

export default function ModificarObservacionItemJuradoPanel({
  observacion,
  nombreItem,
  onCerrar,
}: Props) {
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
    defaultValues: { descripcion: observacion.descripcion },
    mode: 'onTouched',
  });

  const descripcion = useWatch({ control, name: 'descripcion' });
  const { mutate, isPending, reset: resetMutation } = useModificarObservacionItemJurado();
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function enviar(values: FormValues) {
    mutate(
      { observacionId: observacion.id, descripcion: values.descripcion },
      {
        onSuccess: () => {
          toast.success('Observación modificada', 'El texto se guardó correctamente.');
          cerrar();
        },
        onError: (err) => {
          const mensaje = mensajeErrorModificarObservacionItemJurado(err);
          toast.error('No se pudo modificar la observación', mensaje);

          if (CODIGOS_QUE_CIERRAN.some((codigo) => hasApiErrorCode(err, codigo))) {
            cerrar();
            return;
          }
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'descripcion');
          if (delCampo) {
            setError('descripcion', { message: delCampo.message });
          } else if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA)) {
            setError('descripcion', { message: mensaje });
          }
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Modificar observación"
      descripcion={nombreItem}
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
        aria-label="Modificación de observación"
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
            max: LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX,
          }}
        >
          {(campo) => (
            <textarea
              {...campo}
              rows={6}
              maxLength={LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX}
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
