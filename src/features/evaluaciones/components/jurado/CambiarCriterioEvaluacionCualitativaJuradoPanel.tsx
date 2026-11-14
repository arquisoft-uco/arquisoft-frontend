import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiFieldErrors } from '../../../../shared/utils/api-error';
import { useCambiarCriterioEvaluacionCualitativaJurado } from '../../hooks/useCambiarCriterioEvaluacionCualitativaJurado';
import { useCriteriosItemCualitativoJurado } from '../../hooks/useCriteriosItemCualitativoJurado';
import type { EvaluacionCualitativaJurado } from '../../models/EvaluacionCualitativaJurado';
import {
  cambiarCriterioEvaluacionCualitativaJuradoSchema,
  type CambiarCriterioEvaluacionCualitativaJuradoValues,
} from '../../utils/cambiar-criterio-evaluacion-cualitativa-jurado-schema';
import {
  cierraPanelCambiarCriterioEvaluacionCualitativaJurado,
  mensajeErrorCambiarCriterioEvaluacionCualitativaJurado,
} from '../../utils/errores-cambiar-criterio-evaluacion-cualitativa-jurado';
import SelectorCriterioEvaluacionCualitativa, {
  EstadoCatalogoCriterios,
} from './SelectorCriterioEvaluacionCualitativa';

const ID_FORMULARIO = 'cambiar-criterio-evaluacion-cualitativa-jurado';
const ETIQUETAS_CAMPO = { criterioId: 'Criterio' };
interface Props {
  fila: EvaluacionCualitativaJurado;
  evaluacionJuradoId: string;
  onCerrar: () => void;
}

export default function CambiarCriterioEvaluacionCualitativaJuradoPanel({
  fila,
  evaluacionJuradoId,
  onCerrar,
}: Props) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const {
    handleSubmit,
    reset,
    setError,
    setFocus,
    control,
    formState: { errors, isDirty },
  } = useForm<CambiarCriterioEvaluacionCualitativaJuradoValues>({
    resolver: zodResolver(cambiarCriterioEvaluacionCualitativaJuradoSchema),
    defaultValues: { criterioId: fila.criterio.id },
    mode: 'onTouched',
  });

  const catalogo = useCriteriosItemCualitativoJurado();
  const {
    mutate,
    isPending,
    reset: resetMutation,
  } = useCambiarCriterioEvaluacionCualitativaJurado(evaluacionJuradoId);
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];
  const criterios = catalogo.data ?? [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function enviar(values: CambiarCriterioEvaluacionCualitativaJuradoValues) {
    mutate(
      { evaluacionCualitativaJuradoId: fila.id, criterioId: values.criterioId },
      {
        onSuccess: () => {
          toast.success(
            'Criterio cambiado',
            `El criterio de "${fila.item.nombre}" fue actualizado.`,
          );
          cerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudo cambiar el criterio',
            mensajeErrorCambiarCriterioEvaluacionCualitativaJurado(err),
          );
          if (cierraPanelCambiarCriterioEvaluacionCualitativaJurado(err)) {
            cerrar();
            return;
          }
          getApiFieldErrors(err).forEach((fe) => {
            if (fe.field === 'criterio') setError('criterioId', { message: fe.message });
          });
          setResumenVisible(true);
        },
      },
    );
  }

  function contenido() {
    if (catalogo.isLoading || catalogo.isError) {
      return (
        <EstadoCatalogoCriterios
          cargando={catalogo.isLoading}
          onReintentar={() => void catalogo.refetch()}
        />
      );
    }
    return (
      <form
        id={ID_FORMULARIO}
        aria-label="Cambio de criterio de la valoración"
        noValidate
        aria-busy={isPending}
        onSubmit={handleSubmit(enviar, () => setResumenVisible(true))}
        className="flex flex-col gap-6"
      >
        <FormSection titulo="Valoración">
          <SelectorCriterioEvaluacionCualitativa
            control={control}
            criterios={criterios}
            criterioActual={fila.criterio.nombre}
            error={errors.criterioId?.message}
            deshabilitado={isPending}
          />
        </FormSection>
        <ErrorSummary errores={errores} onIrAlCampo={() => setFocus('criterioId')} />
      </form>
    );
  }

  return (
    <SidePanel
      titulo="Cambiar criterio"
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
          sinCambios={!isDirty || criterios.length === 0}
          onCancelar={solicitarCierre}
        />
      )}
    >
      {contenido()}
    </SidePanel>
  );
}
