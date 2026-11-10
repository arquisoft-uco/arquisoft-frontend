import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModificarPlanEstimado } from './useModificarPlanEstimado';
import type { PlanEstimado } from '../models/PlanEstimado';
import type { Tarea } from '../models/Tarea';
import {
  campoDeErrorModificarPlanEstimado,
  mensajeErrorModificarPlanEstimado,
} from '../utils/errores-mapa-ruta';
import {
  ETIQUETAS_PLAN_ESTIMADO,
  comoCampoPlanEstimado,
  modificarPlanEstimadoSchema,
  type ModificarPlanEstimadoValues,
} from '../utils/plan-estimado';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';

interface Opciones {
  tarea: Tarea;
  plan: PlanEstimado;
  onCerrar: () => void;
}

export function useModificarPlanEstimadoForm({ tarea, plan, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<ModificarPlanEstimadoValues>({
    resolver: zodResolver(modificarPlanEstimadoSchema),
    defaultValues: { descripcionEstimado: plan.descripcionEstimado ?? '' },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useModificarPlanEstimado();

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
    const mensaje = mensajeErrorModificarPlanEstimado(err);
    toast.error('No se pudo actualizar el plan estimado', mensaje);
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
      const campo = campoDeErrorModificarPlanEstimado(err);
      if (campo) form.setError(campo, { message: mensaje });
    }
    setResumenVisible(true);
  }

  function modificar(valores: ModificarPlanEstimadoValues) {
    setResumenVisible(false);
    mutate(
      {
        planEstimadoId: plan.id,
        tareaId: tarea.id,
        req: { descripcionEstimado: valores.descripcionEstimado },
      },
      {
        onSuccess: () => {
          toast.success(
            'Plan estimado actualizado',
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
