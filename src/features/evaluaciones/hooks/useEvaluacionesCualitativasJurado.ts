import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export function useEvaluacionesCualitativasJurado(evaluacionJuradoId: string) {
  return useQuery({
    queryKey: ['evaluaciones', 'estudiante', evaluacionJuradoId, 'cualitativas'],
    queryFn: () => evaluacionesService.getEvaluacionesCualitativasJurado(evaluacionJuradoId),
    enabled: !!evaluacionJuradoId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
