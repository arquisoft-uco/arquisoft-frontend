import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors } from '../../../shared/utils/api-error';
import type { EdicionCriterioEnLinea } from '../models/EdicionCriterioEnLinea';
import type { EvaluacionCualitativaAsesor } from '../models/EvaluacionCualitativaAsesor';
import { cambiarCriterioEvaluacionCualitativaAsesorSchema } from '../utils/cambiar-criterio-evaluacion-cualitativa-asesor-schema';
import {
  cierraPanelCambiarCriterioEvaluacionCualitativaAsesor,
  mensajeErrorCambiarCriterioEvaluacionCualitativaAsesor,
} from '../utils/errores-cambiar-criterio-evaluacion-cualitativa-asesor';
import { useCambiarCriterioEvaluacionCualitativaAsesor } from './useCambiarCriterioEvaluacionCualitativaAsesor';

export function useEdicionCriterioEnLineaAsesor(evaluacionAsesorId: string) {
  const [edicion, setEdicion] = useState<EdicionCriterioEnLinea | null>(null);
  const { mutate, isPending, reset } =
    useCambiarCriterioEvaluacionCualitativaAsesor(evaluacionAsesorId);

  function iniciar(fila: EvaluacionCualitativaAsesor) {
    reset();
    setEdicion({
      filaId: fila.id,
      valor: fila.criterio.id,
      valorInicial: fila.criterio.id,
      nombreItem: fila.item.nombre,
    });
  }

  function cambiar(valor: string) {
    setEdicion((actual) => (actual ? { ...actual, valor, error: undefined } : actual));
  }

  function cancelar() {
    reset();
    setEdicion(null);
  }

  function guardar() {
    if (!edicion) return;
    const { filaId, valor, valorInicial, nombreItem } = edicion;
    if (valor === valorInicial) {
      cancelar();
      return;
    }
    const validacion = cambiarCriterioEvaluacionCualitativaAsesorSchema.safeParse({
      criterioId: valor,
    });
    if (!validacion.success) {
      setEdicion({ ...edicion, error: validacion.error.issues[0]?.message });
      return;
    }
    mutate(
      { evaluacionCualitativaAsesorId: filaId, criterioId: validacion.data.criterioId },
      {
        onSuccess: () => {
          toast.success('Criterio cambiado', `El criterio de "${nombreItem}" fue actualizado.`);
          setEdicion(null);
        },
        onError: (err) => {
          const mensaje = mensajeErrorCambiarCriterioEvaluacionCualitativaAsesor(err);
          toast.error('No se pudo cambiar el criterio', mensaje);
          if (cierraPanelCambiarCriterioEvaluacionCualitativaAsesor(err)) {
            setEdicion(null);
            return;
          }
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'criterio');
          setEdicion((actual) =>
            actual ? { ...actual, error: delCampo?.message ?? mensaje } : actual,
          );
        },
      },
    );
  }

  return { edicion, iniciar, cambiar, cancelar, guardar, guardando: isPending };
}
