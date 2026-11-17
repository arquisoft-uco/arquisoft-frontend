import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';
import {
  EVALUACION_JURADO_JURADOS_NO_ASIGNADOS,
  EVALUACION_NO_ENCONTRADA,
} from '../utils/codigos-error-evaluaciones';

export function useRemoverJuradoEvaluacion(evaluacionId: string) {
  const queryClient = useQueryClient();
  const juradosKey = ['evaluaciones', evaluacionId, 'jurados'];

  return useMutation<void, unknown, string>({
    mutationFn: (juradoId) =>
      evaluacionesService.removerJuradosEvaluacion({ evaluacionId, juradosIds: [juradoId] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: juradosKey });
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'coordinador'] });
    },
    onError: (err) => {
      if (
        hasApiErrorCode(err, EVALUACION_JURADO_JURADOS_NO_ASIGNADOS) ||
        hasApiErrorCode(err, EVALUACION_NO_ENCONTRADA)
      ) {
        queryClient.invalidateQueries({ queryKey: juradosKey });
      }
    },
  });
}
