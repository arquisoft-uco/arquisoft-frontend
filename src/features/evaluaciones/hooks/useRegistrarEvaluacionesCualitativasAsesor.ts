import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParEvaluacionCualitativaAsesor } from '../models/ParEvaluacionCualitativaAsesor';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_ASESOR_CRITERIOS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_ASESOR_ITEMS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_ASESOR_ITEMS_YA_REGISTRADOS,
} from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cualitativos-asesor'];
const CRITERIOS_KEY = ['evaluaciones', 'criterios-item-cualitativo-asesor'];

export function useRegistrarEvaluacionesCualitativasAsesor(evaluacionAsesorId: string) {
  const queryClient = useQueryClient();
  const realizadasKey = ['evaluaciones', 'asesor', evaluacionAsesorId, 'cualitativas'];

  return useMutation<void, unknown, ParEvaluacionCualitativaAsesor[]>({
    mutationFn: (evaluaciones) =>
      evaluacionesService.registrarEvaluacionesCualitativasAsesor({
        evaluacionAsesorId,
        evaluaciones,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'asesor'] });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_ITEMS_YA_REGISTRADOS)) {
        queryClient.invalidateQueries({ queryKey: realizadasKey });
      }
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_ITEMS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
      if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_CRITERIOS_NO_ENCONTRADOS)) {
        queryClient.invalidateQueries({ queryKey: CRITERIOS_KEY });
      }
    },
  });
}
