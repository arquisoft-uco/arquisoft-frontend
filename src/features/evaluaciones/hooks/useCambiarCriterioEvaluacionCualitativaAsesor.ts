import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { CambiarCriterioEvaluacionCualitativaAsesorRequest } from '../models/CambiarCriterioEvaluacionCualitativaAsesorRequest';
import {
  EVALUACION_CUALITATIVA_ASESOR_CAMBIO_CRITERIO_EVALUACION_ASESOR_FINALIZADA,
  EVALUACION_CUALITATIVA_ASESOR_CRITERIOS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_CUALITATIVA_NO_ENCONTRADA,
} from '../utils/codigos-error-evaluaciones';

export function useCambiarCriterioEvaluacionCualitativaAsesor(evaluacionAsesorId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'asesor', evaluacionAsesorId, 'cualitativas'];

  return useMutation<void, unknown, CambiarCriterioEvaluacionCualitativaAsesorRequest>({
    mutationFn: (req) => evaluacionesService.cambiarCriterioEvaluacionCualitativaAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listaKey });
    },
    onError: (err) => {
      if (
        hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_CUALITATIVA_NO_ENCONTRADA)
      ) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_CRITERIOS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({
          queryKey: ['evaluaciones', 'criterios-item-cualitativo-asesor'],
        });
      }
      if (
        hasApiErrorCode(
          err,
          EVALUACION_CUALITATIVA_ASESOR_CAMBIO_CRITERIO_EVALUACION_ASESOR_FINALIZADA,
        )
      ) {
        queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'asesor'] });
      }
    },
  });
}
