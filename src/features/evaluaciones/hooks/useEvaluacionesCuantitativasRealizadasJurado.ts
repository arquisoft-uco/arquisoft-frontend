import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export function useEvaluacionesCuantitativasRealizadasJurado(evaluacionJuradoId: string) {
  return useQuery({
    queryKey: ['evaluaciones', 'jurado', evaluacionJuradoId, 'cuantitativas'],
    queryFn: () =>
      evaluacionesService.getEvaluacionesCuantitativasRealizadasJurado(evaluacionJuradoId),
    enabled: !!evaluacionJuradoId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
