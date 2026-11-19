import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { ModificarObservacionItemAsesorRequest } from '../models/ModificarObservacionItemAsesorRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { OBSERVACIONES_EVALUACION_CUANTITATIVA_ASESOR_KEY } from './useObservacionesEvaluacionCuantitativaAsesor';
import { OBSERVACION_ITEM_ASESOR_NO_ENCONTRADA } from '../utils/codigos-error-evaluaciones';

export function useModificarObservacionItemAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarObservacionItemAsesorRequest) =>
      evaluacionesService.modificarObservacionItemAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVACIONES_EVALUACION_CUANTITATIVA_ASESOR_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, OBSERVACION_ITEM_ASESOR_NO_ENCONTRADA)) {
        queryClient.invalidateQueries({
          queryKey: OBSERVACIONES_EVALUACION_CUANTITATIVA_ASESOR_KEY,
        });
      }
    },
  });
}
