import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export function useEvaluacionAsesor(evaluacionId: string) {
  return useQuery({
    queryKey: ['evaluaciones', evaluacionId, 'evaluacion-asesor'],
    queryFn: () => evaluacionesService.getEvaluacionAsesor(evaluacionId),
    enabled: !!evaluacionId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
