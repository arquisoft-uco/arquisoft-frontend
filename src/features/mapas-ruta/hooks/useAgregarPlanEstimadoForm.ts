import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAgregarPlanEstimado } from './useAgregarPlanEstimado';
import type { Tarea } from '../models/Tarea';
import {
  campoDeErrorAgregarPlanEstimado,
  mensajeErrorAgregarPlanEstimado,
} from '../utils/errores-mapa-ruta';
import {
  CAMPOS_PLAN_ESTIMADO,
  ETIQUETAS_PLAN_ESTIMADO,
  comoCampoPlanEstimado,
  planEstimadoSchema,
  type PlanEstimadoValues,
} from '../utils/plan-estimado';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';

interface Opciones {
  tarea: Tarea;
  onCerrar: () => void;
}

export function useAgregarPlanEstimadoForm({ tarea, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<PlanEstimadoValues>({
    resolver: zodResolver(planEstimadoSchema),
    defaultValues: { tiempoEstimadoDias: '', descripcionEstimado: '' },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useAgregarPlanEstimado();

  const errores = resumenVisible
    ? CAMPOS_PLAN_ESTIMADO.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS_PLAN_ESTIMADO[campo], mensaje }] : [];
      })
    : [];

  function irAlCampo(campo: string) {
    const destino = comoCampoPlanEstimado(campo);
    if (destino) form.setFocus(destino);
  }

  function alError(err: unknown) {
    const mensaje = mensajeErrorAgregarPlanEstimado(err);
    toast.error('No se pudo agregar el plan estimado', mensaje);
    if (
      hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA') ||
      hasApiErrorCode(err, 'PLAN_ESTIMADO_DUPLICADO')
    ) {
      onCerrar();
      return;
    }
    let hubo = false;
    for (const fe of getApiFieldErrors(err)) {
      const campo = comoCampoPlanEstimado(fe.field);
      if (campo) {
        form.setError(campo, { message: fe.message });
        hubo = true;
      }
    }
    if (!hubo) {
      const campo = campoDeErrorAgregarPlanEstimado(err);
      if (campo) form.setError(campo, { message: mensaje });
    }
    setResumenVisible(true);
  }

  function agregar(valores: PlanEstimadoValues) {
    setResumenVisible(false);
    mutate(
      {
        tareaId: tarea.id,
        req: {
          tiempoEstimadoDias: Number(valores.tiempoEstimadoDias),
          descripcionEstimado: valores.descripcionEstimado || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Plan estimado agregado', 'Quedó registrado en la tarea.');
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

  const enviar = form.handleSubmit(agregar, () => setResumenVisible(true));

  return { form, enviar, enviando: isPending, cerrar, isDirty, errores, irAlCampo };
}
