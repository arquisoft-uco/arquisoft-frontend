import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export function useEvaluacionAsesorRealizada(evaluacionAsesorId: string) {
  return useQuery({
    queryKey: ['evaluaciones', 'asesor', evaluacionAsesorId, 'informacion'],
    queryFn: () => evaluacionesService.getEvaluacionAsesorRealizada(evaluacionAsesorId),
    enabled: !!evaluacionAsesorId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
