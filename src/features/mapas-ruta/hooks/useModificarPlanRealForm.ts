import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModificarPlanReal } from './useModificarPlanReal';
import type { PlanReal } from '../models/PlanReal';
import type { Tarea } from '../models/Tarea';
import {
  campoDeErrorModificarPlanReal,
  mensajeErrorModificarPlanReal,
} from '../utils/errores-mapa-ruta';
import {
  CAMPOS_PLAN_REAL,
  ETIQUETAS_PLAN_REAL,
  comoCampoPlanReal,
  planRealSchema,
  type ModificarPlanRealValues,
} from '../utils/plan-real';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';

interface Opciones {
  tarea: Tarea;
  plan: PlanReal;
  onCerrar: () => void;
}

export function useModificarPlanRealForm({ tarea, plan, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<ModificarPlanRealValues>({
    resolver: zodResolver(planRealSchema),
    defaultValues: {
      tiempoRealDias: String(plan.tiempoRealDias),
      descripcionReal: plan.descripcionReal ?? '',
    },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useModificarPlanReal();

  const errores = resumenVisible
    ? CAMPOS_PLAN_REAL.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS_PLAN_REAL[campo], mensaje }] : [];
      })
    : [];

  function irAlCampo(campo: string) {
    const destino = comoCampoPlanReal(campo);
    if (destino) form.setFocus(destino);
  }

  function alError(err: unknown) {
    const mensaje = mensajeErrorModificarPlanReal(err);
    toast.error('No se pudo actualizar el plan real', mensaje);
    if (hasApiErrorCode(err, 'PLAN_REAL_NO_ENCONTRADO')) {
      onCerrar();
      return;
    }
    let hubo = false;
    for (const fe of getApiFieldErrors(err)) {
      const campo = comoCampoPlanReal(fe.field);
      if (campo) {
        form.setError(campo, { message: fe.message });
        hubo = true;
      }
    }
    if (!hubo) {
      const campo = campoDeErrorModificarPlanReal(err);
      if (campo) form.setError(campo, { message: mensaje });
    }
    setResumenVisible(true);
  }

  function modificar(valores: ModificarPlanRealValues) {
    setResumenVisible(false);
    mutate(
      {
        planRealId: plan.id,
        tareaId: tarea.id,
        req: {
          tiempoRealDias: Number(valores.tiempoRealDias),
          descripcionReal: valores.descripcionReal,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            'Plan real actualizado',
            'Los cambios ya se ven en el detalle de la tarea.',
          );
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

  const enviar = form.handleSubmit(modificar, () => setResumenVisible(true));

  return { form, enviar, enviando: isPending, cerrar, isDirty, errores, irAlCampo };
}
