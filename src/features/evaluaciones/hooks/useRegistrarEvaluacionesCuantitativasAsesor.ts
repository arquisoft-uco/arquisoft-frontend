import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParEvaluacionCuantitativaAsesor } from '../models/ParEvaluacionCuantitativaAsesor';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { EVALUACION_CUANTITATIVA_ASESOR_ITEMS_NO_ENCONTRADOS } from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cuantitativos-asesor'];

export function useRegistrarEvaluacionesCuantitativasAsesor(evaluacionAsesorId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, ParEvaluacionCuantitativaAsesor[]>({
    mutationFn: (evaluaciones) =>
      evaluacionesService.registrarEvaluacionesCuantitativasAsesor({
        evaluacionAsesorId,
        evaluaciones,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'asesor'] });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_ITEMS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
    },
  });
}
