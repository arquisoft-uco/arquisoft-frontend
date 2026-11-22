import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParEvaluacionCuantitativaJurado } from '../models/ParEvaluacionCuantitativaJurado';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUANTITATIVA_JURADO_ITEMS_NO_ENCONTRADOS,
  EVALUACION_CUANTITATIVA_JURADO_ITEMS_YA_REGISTRADOS,
} from '../utils/codigos-error-evaluaciones';

const ASIGNADA_KEY = ['evaluaciones', 'jurado', 'asignada'];
const ASIGNADAS_KEY = ['evaluaciones', 'jurado', 'asignadas'];
const ITEMS_KEY = ['evaluaciones', 'items-cuantitativos-jurado'];

export function useRegistrarEvaluacionesCuantitativasJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'jurado', evaluacionJuradoId, 'cuantitativas'];

  return useMutation<void, unknown, ParEvaluacionCuantitativaJurado[]>({
    mutationFn: (evaluaciones) =>
      evaluacionesService.registrarEvaluacionesCuantitativasJurado({
        evaluacionJuradoId,
        evaluaciones,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listaKey });
      queryClient.invalidateQueries({ queryKey: ASIGNADA_KEY });
      queryClient.invalidateQueries({ queryKey: ASIGNADAS_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_ITEMS_YA_REGISTRADOS)) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_ITEMS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
    },
  });
}
