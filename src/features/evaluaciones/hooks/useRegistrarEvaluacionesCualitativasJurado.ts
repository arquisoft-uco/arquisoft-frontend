import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParEvaluacionCualitativaJurado } from '../models/ParEvaluacionCualitativaJurado';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_JURADO_ITEMS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_JURADO_ITEMS_YA_REGISTRADOS,
} from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cualitativos-jurado'];
const ASIGNADA_KEY = ['evaluaciones', 'jurado', 'asignada'];
const ASIGNADAS_KEY = ['evaluaciones', 'jurado', 'asignadas'];
const CRITERIOS_KEY = ['evaluaciones', 'criterios-item-cualitativo-jurado'];

export function useRegistrarEvaluacionesCualitativasJurado(evaluacionJuradoId: string) {
  const queryClient = useQueryClient();
  const listaKey = ['evaluaciones', 'jurado', evaluacionJuradoId, 'cualitativas'];

  return useMutation<void, unknown, ParEvaluacionCualitativaJurado[]>({
    mutationFn: (evaluaciones) =>
      evaluacionesService.registrarEvaluacionesCualitativasJurado({
        evaluacionJuradoId,
        evaluaciones,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listaKey });
      queryClient.invalidateQueries({ queryKey: ASIGNADA_KEY });
      queryClient.invalidateQueries({ queryKey: ASIGNADAS_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_ITEMS_YA_REGISTRADOS)) {
        queryClient.invalidateQueries({ queryKey: listaKey });
      }
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_ITEMS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: CRITERIOS_KEY });
      }
    },
  });
}
