import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { CambiarPuntajeEvaluacionCuantitativaAsesorRequest } from '../models/CambiarPuntajeEvaluacionCuantitativaAsesorRequest';
import {
  EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA,
  EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUANTITATIVA_ASESOR_PUNTAJE_EXCEDE_VALOR_ITEM,
} from '../utils/codigos-error-evaluaciones';

export function useCambiarPuntajeEvaluacionCuantitativaAsesor(evaluacionAsesorId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'asesor', evaluacionAsesorId, 'cuantitativas'];

  return useMutation<void, unknown, CambiarPuntajeEvaluacionCuantitativaAsesorRequest>({
    mutationFn: (req) => evaluacionesService.cambiarPuntajeEvaluacionCuantitativaAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listaKey });
    },
    onError: (err) => {
      if (
        hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA) ||
        hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_PUNTAJE_EXCEDE_VALOR_ITEM)
      ) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (
        hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA)
      ) {
        queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'asesor'] });
      }
    },
  });
}
