import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAportarPlanReal } from './useAportarPlanReal';
import type { PlanRealProyecto } from '../models/PlanRealProyecto';
import {
  campoDeErrorAportarPlanReal,
  mensajeErrorAportarPlanReal,
} from '../utils/errores-mapa-ruta';
import {
  ETIQUETAS_PLAN_REAL,
  aportarPlanRealSchema,
  comoCampoPlanReal,
  type AportarPlanRealValues,
} from '../utils/plan-real';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';

interface Opciones {
  proyectoGradoId: string;
  plan: PlanRealProyecto;
  onCerrar: () => void;
}

export function useAportarPlanRealForm({ proyectoGradoId, plan, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<AportarPlanRealValues>({
    resolver: zodResolver(aportarPlanRealSchema),
    defaultValues: { descripcionReal: plan.descripcionReal ?? '' },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useAportarPlanReal(proyectoGradoId);

  const mensajeDescripcion = errors.descripcionReal?.message;
  const errores =
    resumenVisible && mensajeDescripcion
      ? [
          {
            campo: 'descripcionReal',
            etiqueta: ETIQUETAS_PLAN_REAL.descripcionReal,
            mensaje: mensajeDescripcion,
          },
        ]
      : [];

  function irAlCampo(campo: string) {
    if (comoCampoPlanReal(campo) === 'descripcionReal') {
      form.setFocus('descripcionReal');
    }
  }

  function alError(err: unknown) {
    const mensaje = mensajeErrorAportarPlanReal(err);
    toast.error('No se pudo registrar el aporte', mensaje);
    if (hasApiErrorCode(err, 'PLAN_REAL_NO_ENCONTRADO')) {
      onCerrar();
      return;
    }
    let hubo = false;
    for (const fe of getApiFieldErrors(err)) {
      if (comoCampoPlanReal(fe.field) === 'descripcionReal') {
        form.setError('descripcionReal', { message: fe.message });
        hubo = true;
      }
    }
    if (!hubo) {
      const campo = campoDeErrorAportarPlanReal(err);
      if (campo) form.setError(campo, { message: mensaje });
    }
    setResumenVisible(true);
  }

  function aportar(valores: AportarPlanRealValues) {
    setResumenVisible(false);
    mutate(
      { planRealId: plan.id, req: { descripcionReal: valores.descripcionReal } },
      {
        onSuccess: () => {
          toast.success('Aporte registrado', 'La descripción del plan real se actualizó.');
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
