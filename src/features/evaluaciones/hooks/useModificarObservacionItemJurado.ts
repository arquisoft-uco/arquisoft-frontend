import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { ModificarObservacionItemJuradoRequest } from '../models/ModificarObservacionItemJuradoRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { OBSERVACIONES_EVALUACION_CUANTITATIVA_JURADO_KEY } from './useObservacionesEvaluacionCuantitativaJurado';
import { OBSERVACION_ITEM_JURADO_NO_ENCONTRADA } from '../utils/codigos-error-evaluaciones';

export function useModificarObservacionItemJurado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarObservacionItemJuradoRequest) =>
      evaluacionesService.modificarObservacionItemJurado(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVACIONES_EVALUACION_CUANTITATIVA_JURADO_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_NO_ENCONTRADA)) {
        queryClient.invalidateQueries({
          queryKey: OBSERVACIONES_EVALUACION_CUANTITATIVA_JURADO_KEY,
        });
      }
    },
  });
}
