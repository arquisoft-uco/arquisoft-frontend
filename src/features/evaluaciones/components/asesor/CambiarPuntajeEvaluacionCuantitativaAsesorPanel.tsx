import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiFieldErrors } from '../../../../shared/utils/api-error';
import { LIMITES } from '../../../../shared/validation';
import { useCambiarPuntajeEvaluacionCuantitativaAsesor } from '../../hooks/useCambiarPuntajeEvaluacionCuantitativaAsesor';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import {
  crearCambiarPuntajeEvaluacionCuantitativaAsesorSchema,
  type CambiarPuntajeEvaluacionCuantitativaAsesorValues,
} from '../../utils/cambiar-puntaje-evaluacion-cuantitativa-asesor-schema';
import {
  cierraPanelCambiarPuntajeEvaluacionCuantitativaAsesor,
  mensajeErrorCambiarPuntajeEvaluacionCuantitativaAsesor,
} from '../../utils/errores-cambiar-puntaje-evaluacion-cuantitativa-asesor';

const ID_FORMULARIO = 'cambiar-puntaje-evaluacion-cuantitativa-asesor';
const ETIQUETAS_CAMPO = { puntaje: 'Puntaje' };
const DIGITOS_MAXIMOS = String(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX).length;

interface Props {
  fila: EvaluacionCuantitativaAsesor;
  evaluacionAsesorId: string;
  onCerrar: () => void;
}

export default function CambiarPuntajeEvaluacionCuantitativaAsesorPanel({
  fila,
  evaluacionAsesorId,
  onCerrar,
}: Props) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const schema = useMemo(
    () => crearCambiarPuntajeEvaluacionCuantitativaAsesorSchema(fila.item.valor),
    [fila.item.valor],
  );
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isDirty },
  } = useForm<CambiarPuntajeEvaluacionCuantitativaAsesorValues>({
    resolver: zodResolver(schema),
    defaultValues: { puntaje: String(fila.puntaje) },
    mode: 'onTouched',
  });
  const {
    mutate,
    isPending,
    reset: resetMutation,
  } = useCambiarPuntajeEvaluacionCuantitativaAsesor(evaluacionAsesorId);
  const erroresResumen = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function enviar(values: CambiarPuntajeEvaluacionCuantitativaAsesorValues) {
    mutate(
      { evaluacionCuantitativaAsesorId: fila.id, puntaje: Number(values.puntaje) },
      {
        onSuccess: () => {
          toast.success('Puntaje cambiado', `El puntaje de "${fila.item.nombre}" fue actualizado.`);
          cerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudo cambiar el puntaje',
            mensajeErrorCambiarPuntajeEvaluacionCuantitativaAsesor(err),
          );
          if (cierraPanelCambiarPuntajeEvaluacionCuantitativaAsesor(err)) {
            cerrar();
            return;
          }
          getApiFieldErrors(err).forEach((fe) => {
            if (fe.field === 'puntaje') setError('puntaje', { message: fe.message });
          });
          setResumenVisible(true);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Cambiar puntaje"
      descripcion={`Ítem: ${fila.item.nombre}`}
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
        aria-label="Cambio de puntaje de la valoración"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-6"
      >
        <FormSection titulo="Valoración">
          <Field
            etiqueta="Puntaje"
            ayuda={`Entre ${LIMITES.ITEM_CUANTITATIVO_VALOR_MIN} y ${fila.item.valor}`}
            error={errors.puntaje?.message}
            corto
          >
            {(control) => (
              <input
                {...control}
                {...register('puntaje')}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="field-input"
                maxLength={DIGITOS_MAXIMOS}
                disabled={isPending}
              />
            )}
          </Field>
        </FormSection>
        <ErrorSummary errores={erroresResumen} onIrAlCampo={() => setFocus('puntaje')} />
      </form>
    </SidePanel>
  );
}
