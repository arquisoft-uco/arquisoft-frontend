import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS,
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_FINALIZADA,
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
} from '../utils/codigos-error-evaluaciones';

const ASIGNADAS_KEY = ['evaluaciones', 'jurado', 'asignadas'];

export function useOmitirEvaluacionesCualitativasJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'jurado', evaluacionJuradoId, 'cualitativas'];

  return useMutation<void, unknown, string[]>({
    mutationFn: (evaluaciones) =>
      evaluacionesService.omitirEvaluacionesCualitativasJurado({
        evaluacionJuradoId,
        evaluaciones,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listaKey });
      queryClient.invalidateQueries({ queryKey: ASIGNADAS_KEY });
    },
    onError: (err) => {
      if (
        hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS) ||
        hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA)
      ) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_FINALIZADA)) {
        queryClient.invalidateQueries({ queryKey: ASIGNADAS_KEY });
      }
    },
  });
}
