import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import type { ObservacionItemEvaluacionCuantitativa } from '../models/ObservacionItemEvaluacionCuantitativa';
import type { ObservacionPendienteEvaluacionCuantitativa } from '../models/ObservacionPendienteEvaluacionCuantitativa';
import { evaluacionesService } from '../services/evaluacionesService';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA } from '../utils/codigos-error-evaluaciones';
import { mensajeErrorRegistroObservacionItemJurado } from '../utils/errores-registro-observacion-item-jurado';

const MOTIVO_SIN_VALORACION = 'No se encontró la valoración registrada de este ítem.';

export function useRegistrarObservacionesEvaluacionCuantitativaJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ObservacionPendienteEvaluacionCuantitativa[],
    unknown,
    ObservacionItemEvaluacionCuantitativa[]
  >({
    mutationFn: async (observaciones) => {
      let valoraciones: EvaluacionCuantitativaJurado[];
      try {
        valoraciones = await queryClient.fetchQuery({
          queryKey: ['evaluaciones', 'jurado', evaluacionJuradoId, 'cuantitativas'],
          queryFn: () =>
            evaluacionesService.getEvaluacionesCuantitativasRealizadasJurado(evaluacionJuradoId),
          staleTime: 0,
        });
      } catch (err) {
        const motivo = getApiErrorMessage(err, 'No se pudieron consultar las valoraciones.');
        return observaciones.map((o) => ({ ...o, motivo }));
      }

      const idPorItem = new Map(valoraciones.map((v) => [v.item.id, v.id]));
      const resultados = await Promise.allSettled(
        observaciones.map((o) => {
          const evaluacionCuantitativaJuradoId = idPorItem.get(o.itemId);
          if (!evaluacionCuantitativaJuradoId) return Promise.reject(MOTIVO_SIN_VALORACION);
          return evaluacionesService.registrarObservacionItemJurado({
            evaluacionCuantitativaJuradoId,
            descripcion: o.descripcion,
          });
        }),
      );

      const pendientes: ObservacionPendienteEvaluacionCuantitativa[] = [];
      resultados.forEach((resultado, i) => {
        if (resultado.status === 'fulfilled') return;
        if (hasApiErrorCode(resultado.reason, OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA))
          return;
        pendientes.push({
          ...observaciones[i],
          motivo: idPorItem.has(observaciones[i].itemId)
            ? mensajeErrorRegistroObservacionItemJurado(resultado.reason)
            : MOTIVO_SIN_VALORACION,
        });
      });
      return pendientes;
    },
  });
}
