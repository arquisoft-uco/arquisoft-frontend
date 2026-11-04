import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export function useEvaluacionesCuantitativasJurado(evaluacionJuradoId: string) {
  return useQuery({
    queryKey: ['evaluaciones', 'estudiante', evaluacionJuradoId, 'cuantitativas'],
    queryFn: () => evaluacionesService.getEvaluacionesCuantitativasJurado(evaluacionJuradoId),
    enabled: !!evaluacionJuradoId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
