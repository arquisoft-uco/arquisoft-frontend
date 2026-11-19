import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { LIMITES } from '../../../../shared/validation';
import { useCambiarPuntajeEvaluacionCuantitativaJurado } from '../../hooks/useCambiarPuntajeEvaluacionCuantitativaJurado';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';
import {
  cambiarPuntajeEvaluacionCuantitativaJuradoSchema,
  type CambiarPuntajeEvaluacionCuantitativaJuradoValues,
} from '../../utils/cambiar-puntaje-evaluacion-cuantitativa-jurado-schema';
import { EVALUACION_CUANTITATIVA_JURADO_PUNTAJE_EXCEDE_VALOR_ITEM } from '../../utils/codigos-error-evaluaciones';
import {
  cierraPanelCambiarPuntajeEvaluacionCuantitativaJurado,
  mensajeErrorCambiarPuntajeEvaluacionCuantitativaJurado,
} from '../../utils/errores-cambiar-puntaje-evaluacion-cuantitativa-jurado';

const ID_FORMULARIO = 'cambiar-puntaje-evaluacion-cuantitativa-jurado';
const ETIQUETAS_CAMPO = { puntaje: 'Puntaje' };
const DIGITOS_MAXIMOS = String(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX).length;

interface Props {
  fila: EvaluacionCuantitativaJurado;
  evaluacionJuradoId: string;
  onCerrar: () => void;
}

export default function CambiarPuntajeEvaluacionCuantitativaJuradoPanel({
  fila,
  evaluacionJuradoId,
  onCerrar,
}: Props) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const valorMaximo = fila.item.valor;
  const schema = useMemo(
    () => cambiarPuntajeEvaluacionCuantitativaJuradoSchema(valorMaximo),
    [valorMaximo],
  );
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isDirty },
  } = useForm<CambiarPuntajeEvaluacionCuantitativaJuradoValues>({
    resolver: zodResolver(schema),
    defaultValues: { puntaje: String(fila.puntaje) },
    mode: 'onTouched',
  });

  const {
    mutate,
    isPending,
    reset: resetMutation,
  } = useCambiarPuntajeEvaluacionCuantitativaJurado(evaluacionJuradoId);
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function enviar(values: CambiarPuntajeEvaluacionCuantitativaJuradoValues) {
    mutate(
      { evaluacionCuantitativaJuradoId: fila.id, puntaje: Number(values.puntaje.trim()) },
      {
        onSuccess: () => {
          toast.success('Puntaje cambiado', `El puntaje de "${fila.item.nombre}" fue actualizado.`);
          cerrar();
        },
        onError: (err) => {
          const mensaje = mensajeErrorCambiarPuntajeEvaluacionCuantitativaJurado(err);
          toast.error('No se pudo cambiar el puntaje', mensaje);
          if (cierraPanelCambiarPuntajeEvaluacionCuantitativaJurado(err)) {
            cerrar();
            return;
          }
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'puntaje');
          if (delCampo) {
            setError('puntaje', { message: delCampo.message });
          } else if (
            hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_PUNTAJE_EXCEDE_VALOR_ITEM)
          ) {
            setError('puntaje', { message: mensaje });
          }
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
        className="flex flex-col gap-5"
      >
        <Field
          etiqueta={ETIQUETAS_CAMPO.puntaje}
          ayuda={`Entre ${LIMITES.ITEM_CUANTITATIVO_VALOR_MIN} y ${valorMaximo}`}
          error={errors.puntaje?.message}
          corto
        >
          {(campo) => (
            <input
              {...campo}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={DIGITOS_MAXIMOS}
              className="field-input"
              {...register('puntaje')}
            />
          )}
        </Field>
        <ErrorSummary errores={errores} onIrAlCampo={() => setFocus('puntaje')} />
      </form>
    </SidePanel>
  );
}
