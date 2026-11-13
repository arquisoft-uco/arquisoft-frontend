import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAportarPlanEstimado } from './useAportarPlanEstimado';
import type { PlanEstimadoProyecto } from '../models/PlanEstimadoProyecto';
import {
  campoDeErrorAportarPlanEstimado,
  mensajeErrorAportarPlanEstimado,
} from '../utils/errores-mapa-ruta';
import {
  ETIQUETAS_PLAN_ESTIMADO,
  aportarPlanEstimadoSchema,
  comoCampoPlanEstimado,
  type AportarPlanEstimadoValues,
} from '../utils/plan-estimado';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';

interface Opciones {
  proyectoGradoId: string;
  plan: PlanEstimadoProyecto;
  onCerrar: () => void;
}

export function useAportarPlanEstimadoForm({ proyectoGradoId, plan, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<AportarPlanEstimadoValues>({
    resolver: zodResolver(aportarPlanEstimadoSchema),
    defaultValues: { descripcionEstimado: plan.descripcionEstimado ?? '' },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useAportarPlanEstimado(proyectoGradoId);

  const mensajeDescripcion = errors.descripcionEstimado?.message;
  const errores =
    resumenVisible && mensajeDescripcion
      ? [
          {
            campo: 'descripcionEstimado',
            etiqueta: ETIQUETAS_PLAN_ESTIMADO.descripcionEstimado,
            mensaje: mensajeDescripcion,
          },
        ]
      : [];

  function irAlCampo(campo: string) {
    if (comoCampoPlanEstimado(campo) === 'descripcionEstimado') {
      form.setFocus('descripcionEstimado');
    }
  }

  function alError(err: unknown) {
    const mensaje = mensajeErrorAportarPlanEstimado(err);
    toast.error('No se pudo registrar el aporte', mensaje);
    if (hasApiErrorCode(err, 'PLAN_ESTIMADO_NO_ENCONTRADO')) {
      onCerrar();
      return;
    }
    let hubo = false;
    for (const fe of getApiFieldErrors(err)) {
      if (comoCampoPlanEstimado(fe.field) === 'descripcionEstimado') {
        form.setError('descripcionEstimado', { message: fe.message });
        hubo = true;
      }
    }
    if (!hubo) {
      const campo = campoDeErrorAportarPlanEstimado(err);
      if (campo) form.setError(campo, { message: mensaje });
    }
    setResumenVisible(true);
  }

  function aportar(valores: AportarPlanEstimadoValues) {
    setResumenVisible(false);
    mutate(
      { planEstimadoId: plan.id, req: { descripcionEstimado: valores.descripcionEstimado } },
      {
        onSuccess: () => {
          toast.success('Aporte registrado', 'La descripción del plan estimado se actualizó.');
          onCerrar();
        },
        onError: alError,
      },
    );
  }

  function cerrar() {
    form.reset();
    reiniciarMutacion();
    onCerrar();
  }

  const enviar = form.handleSubmit(aportar, () => setResumenVisible(true));

  return { form, enviar, enviando: isPending, cerrar, isDirty, errores, irAlCampo };
}
