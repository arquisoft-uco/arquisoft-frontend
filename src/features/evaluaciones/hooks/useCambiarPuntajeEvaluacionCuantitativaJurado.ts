import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { CambiarPuntajeEvaluacionCuantitativaJuradoRequest } from '../models/CambiarPuntajeEvaluacionCuantitativaJuradoRequest';
import {
  EVALUACION_CUANTITATIVA_JURADO_EVALUACION_FINALIZADA,
  EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA,
} from '../utils/codigos-error-evaluaciones';

export function useCambiarPuntajeEvaluacionCuantitativaJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'jurado', evaluacionJuradoId, 'cuantitativas'];

  return useMutation<void, unknown, CambiarPuntajeEvaluacionCuantitativaJuradoRequest>({
    mutationFn: (req) => evaluacionesService.cambiarPuntajeEvaluacionCuantitativaJurado(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listaKey });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA)) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_EVALUACION_FINALIZADA)) {
        queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'jurado', 'asignadas'] });
      }
    },
  });
}
