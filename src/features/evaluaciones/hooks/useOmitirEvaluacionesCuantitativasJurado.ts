import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
  EVALUACION_CUANTITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS,
  EVALUACION_CUANTITATIVA_JURADO_OMISION_EVALUACION_JURADO_FINALIZADA,
} from '../utils/codigos-error-evaluaciones';

const ASIGNADA_KEY = ['evaluaciones', 'jurado', 'asignada'];
const ASIGNADAS_KEY = ['evaluaciones', 'jurado', 'asignadas'];

export function useOmitirEvaluacionesCuantitativasJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'jurado', evaluacionJuradoId, 'cuantitativas'];

  return useMutation<void, unknown, string[]>({
    mutationFn: (evaluaciones) =>
      evaluacionesService.omitirEvaluacionesCuantitativasJurado({
        evaluacionJuradoId,
        evaluaciones,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listaKey });
      queryClient.invalidateQueries({ queryKey: ASIGNADA_KEY });
      queryClient.invalidateQueries({ queryKey: ASIGNADAS_KEY });
    },
    onError: (err) => {
      if (
        hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS) ||
        hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA)
      ) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (
        hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_OMISION_EVALUACION_JURADO_FINALIZADA)
      ) {
        queryClient.invalidateQueries({ queryKey: ASIGNADAS_KEY });
      }
    },
  });
}
