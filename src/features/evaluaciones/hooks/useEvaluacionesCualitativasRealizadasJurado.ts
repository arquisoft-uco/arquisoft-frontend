import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export function useEvaluacionesCualitativasRealizadasJurado(evaluacionJuradoId: string) {
  return useQuery({
    queryKey: ['evaluaciones', 'jurado', evaluacionJuradoId, 'cualitativas'],
    queryFn: () =>
      evaluacionesService.getEvaluacionesCualitativasRealizadasJurado(evaluacionJuradoId),
    enabled: !!evaluacionJuradoId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
