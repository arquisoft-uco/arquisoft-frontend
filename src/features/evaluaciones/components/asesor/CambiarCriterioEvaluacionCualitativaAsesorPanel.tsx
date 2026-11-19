import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiFieldErrors } from '../../../../shared/utils/api-error';
import { useCambiarCriterioEvaluacionCualitativaAsesor } from '../../hooks/useCambiarCriterioEvaluacionCualitativaAsesor';
import { useCriteriosItemCualitativoAsesor } from '../../hooks/useCriteriosItemCualitativoAsesor';
import type { EvaluacionCualitativaAsesor } from '../../models/EvaluacionCualitativaAsesor';
import {
  cambiarCriterioEvaluacionCualitativaAsesorSchema,
  type CambiarCriterioEvaluacionCualitativaAsesorValues,
} from '../../utils/cambiar-criterio-evaluacion-cualitativa-asesor-schema';
import {
  cierraPanelCambiarCriterioEvaluacionCualitativaAsesor,
  mensajeErrorCambiarCriterioEvaluacionCualitativaAsesor,
} from '../../utils/errores-cambiar-criterio-evaluacion-cualitativa-asesor';
import SelectorCriterioEvaluacionCualitativa, {
  EstadoCatalogoCriterios,
} from '../jurado/SelectorCriterioEvaluacionCualitativa';

const ID_FORMULARIO = 'cambiar-criterio-evaluacion-cualitativa-asesor';
const ETIQUETAS_CAMPO = { criterioId: 'Criterio' };
interface Props {
  fila: EvaluacionCualitativaAsesor;
  evaluacionAsesorId: string;
  onCerrar: () => void;
}

export default function CambiarCriterioEvaluacionCualitativaAsesorPanel({
  fila,
  evaluacionAsesorId,
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
  } = useForm<CambiarCriterioEvaluacionCualitativaAsesorValues>({
    resolver: zodResolver(cambiarCriterioEvaluacionCualitativaAsesorSchema),
    defaultValues: { criterioId: fila.criterio.id },
    mode: 'onTouched',
  });

  const catalogo = useCriteriosItemCualitativoAsesor();
  const {
    mutate,
    isPending,
    reset: resetMutation,
  } = useCambiarCriterioEvaluacionCualitativaAsesor(evaluacionAsesorId);
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];
  const criterios = catalogo.data ?? [];

  function cerrar() {
    reset();
    resetMutation();
    onCerrar();
  }

  function enviar(values: CambiarCriterioEvaluacionCualitativaAsesorValues) {
    mutate(
      { evaluacionCualitativaAsesorId: fila.id, criterioId: values.criterioId },
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
            mensajeErrorCambiarCriterioEvaluacionCualitativaAsesor(err),
          );
          if (cierraPanelCambiarCriterioEvaluacionCualitativaAsesor(err)) {
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
