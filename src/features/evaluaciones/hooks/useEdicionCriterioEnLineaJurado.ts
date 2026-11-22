import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors } from '../../../shared/utils/api-error';
import type { EdicionCriterioEnLinea } from '../models/EdicionCriterioEnLinea';
import type { EvaluacionCualitativaJurado } from '../models/EvaluacionCualitativaJurado';
import { cambiarCriterioEvaluacionCualitativaJuradoSchema } from '../utils/cambiar-criterio-evaluacion-cualitativa-jurado-schema';
import {
  cierraPanelCambiarCriterioEvaluacionCualitativaJurado,
  mensajeErrorCambiarCriterioEvaluacionCualitativaJurado,
} from '../utils/errores-cambiar-criterio-evaluacion-cualitativa-jurado';
import { useCambiarCriterioEvaluacionCualitativaJurado } from './useCambiarCriterioEvaluacionCualitativaJurado';

export function useEdicionCriterioEnLineaJurado(evaluacionJuradoId: string) {
  const [edicion, setEdicion] = useState<EdicionCriterioEnLinea | null>(null);
  const { mutate, isPending, reset } =
    useCambiarCriterioEvaluacionCualitativaJurado(evaluacionJuradoId);

  function iniciar(fila: EvaluacionCualitativaJurado) {
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
    const validacion = cambiarCriterioEvaluacionCualitativaJuradoSchema.safeParse({
      criterioId: valor,
    });
    if (!validacion.success) {
      setEdicion({ ...edicion, error: validacion.error.issues[0]?.message });
      return;
    }
    mutate(
      { evaluacionCualitativaJuradoId: filaId, criterioId: validacion.data.criterioId },
      {
        onSuccess: () => {
          toast.success('Criterio cambiado', `El criterio de "${nombreItem}" fue actualizado.`);
          setEdicion(null);
        },
        onError: (err) => {
          const mensaje = mensajeErrorCambiarCriterioEvaluacionCualitativaJurado(err);
          toast.error('No se pudo cambiar el criterio', mensaje);
          if (cierraPanelCambiarCriterioEvaluacionCualitativaJurado(err)) {
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
