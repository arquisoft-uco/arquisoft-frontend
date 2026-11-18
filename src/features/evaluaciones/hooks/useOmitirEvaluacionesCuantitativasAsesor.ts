import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUANTITATIVA_ASESOR_EVALUACIONES_NO_REGISTRADAS,
  EVALUACION_CUANTITATIVA_ASESOR_OMISION_EVALUACION_ASESOR_FINALIZADA,
} from '../utils/codigos-error-evaluaciones';

const ASESOR_KEY = ['evaluaciones', 'asesor'];

export function useOmitirEvaluacionesCuantitativasAsesor(evaluacionAsesorId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'asesor', evaluacionAsesorId, 'cuantitativas'];

  return useMutation<void, unknown, string[]>({
    mutationFn: (items) =>
      evaluacionesService.omitirEvaluacionesCuantitativasAsesor({ evaluacionAsesorId, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASESOR_KEY });
    },
    onError: (err) => {
      if (
        hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_EVALUACIONES_NO_REGISTRADAS) ||
        hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA)
      ) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (
        hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_OMISION_EVALUACION_ASESOR_FINALIZADA)
      ) {
        queryClient.invalidateQueries({ queryKey: ASESOR_KEY });
      }
    },
  });
}
