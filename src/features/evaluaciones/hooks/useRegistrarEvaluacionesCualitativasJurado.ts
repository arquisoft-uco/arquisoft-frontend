import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParEvaluacionCualitativaJurado } from '../models/ParEvaluacionCualitativaJurado';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_JURADO_ITEMS_NO_ENCONTRADOS,
} from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cualitativos-jurado'];
const CRITERIOS_KEY = ['evaluaciones', 'criterios-item-cualitativo-jurado'];

export function useRegistrarEvaluacionesCualitativasJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, ParEvaluacionCualitativaJurado[]>({
    mutationFn: (evaluaciones) =>
      evaluacionesService.registrarEvaluacionesCualitativasJurado({
        evaluacionJuradoId,
        evaluaciones,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['evaluaciones', 'jurado', evaluacionJuradoId, 'cualitativas'],
      });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_ITEMS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: CRITERIOS_KEY });
      }
    },
  });
}
