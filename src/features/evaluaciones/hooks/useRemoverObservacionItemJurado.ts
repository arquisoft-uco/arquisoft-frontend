import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';
import { OBSERVACION_ITEM_JURADO_NO_ENCONTRADA } from '../utils/codigos-error-evaluaciones';
import { OBSERVACIONES_EVALUACION_CUANTITATIVA_JURADO_KEY } from './useObservacionesEvaluacionCuantitativaJurado';

export function useRemoverObservacionItemJurado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (observacionId: string) =>
      evaluacionesService.removerObservacionItemJurado(observacionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVACIONES_EVALUACION_CUANTITATIVA_JURADO_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_NO_ENCONTRADA)) {
        queryClient.invalidateQueries({
          queryKey: OBSERVACIONES_EVALUACION_CUANTITATIVA_JURADO_KEY,
        });
      }
    },
  });
}
