import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParEvaluacionCuantitativaJurado } from '../models/ParEvaluacionCuantitativaJurado';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { EVALUACION_CUANTITATIVA_JURADO_ITEMS_NO_ENCONTRADOS } from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cuantitativos-jurado'];

export function useRegistrarEvaluacionesCuantitativasJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, ParEvaluacionCuantitativaJurado[]>({
    mutationFn: (evaluaciones) =>
      evaluacionesService.registrarEvaluacionesCuantitativasJurado({
        evaluacionJuradoId,
        evaluaciones,
      }),
    onError: (err) => {
      if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_ITEMS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
    },
  });
}
