import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { CambiarCriterioEvaluacionCualitativaJuradoRequest } from '../models/CambiarCriterioEvaluacionCualitativaJuradoRequest';
import {
  EVALUACION_CUALITATIVA_JURADO_CAMBIO_CRITERIO_EVALUACION_JURADO_FINALIZADA,
  EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA,
} from '../utils/codigos-error-evaluaciones';

export function useCambiarCriterioEvaluacionCualitativaJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'jurado', evaluacionJuradoId, 'cualitativas'];

  return useMutation<void, unknown, CambiarCriterioEvaluacionCualitativaJuradoRequest>({
    mutationFn: (req) => evaluacionesService.cambiarCriterioEvaluacionCualitativaJurado(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listaKey });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA)) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({
          queryKey: ['evaluaciones', 'criterios-item-cualitativo-jurado'],
        });
      }
      if (
        hasApiErrorCode(
          err,
          EVALUACION_CUALITATIVA_JURADO_CAMBIO_CRITERIO_EVALUACION_JURADO_FINALIZADA,
        )
      ) {
        queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'jurado', 'asignadas'] });
      }
    },
  });
}
