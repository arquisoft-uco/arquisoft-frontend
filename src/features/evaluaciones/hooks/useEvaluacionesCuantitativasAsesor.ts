import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export function useEvaluacionesCuantitativasAsesor(evaluacionAsesorId: string) {
  return useQuery({
    queryKey: ['evaluaciones', 'asesor', evaluacionAsesorId, 'cuantitativas'],
    queryFn: () => evaluacionesService.getEvaluacionesCuantitativasAsesor(evaluacionAsesorId),
    enabled: !!evaluacionAsesorId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
