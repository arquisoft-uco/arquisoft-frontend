import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { RegistrarObservacionItemAsesorRequest } from '../models/RegistrarObservacionItemAsesorRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA } from '../utils/codigos-error-evaluaciones';
import { OBSERVACIONES_EVALUACION_CUANTITATIVA_ASESOR_KEY } from './useObservacionesEvaluacionCuantitativaAsesor';

export function useRegistrarObservacionItemAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegistrarObservacionItemAsesorRequest) =>
      evaluacionesService.registrarObservacionItemAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVACIONES_EVALUACION_CUANTITATIVA_ASESOR_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA)) {
        queryClient.invalidateQueries({
          queryKey: OBSERVACIONES_EVALUACION_CUANTITATIVA_ASESOR_KEY,
        });
      }
    },
  });
}
