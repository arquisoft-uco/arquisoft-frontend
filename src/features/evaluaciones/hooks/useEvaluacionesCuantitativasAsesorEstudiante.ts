import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export function useEvaluacionesCuantitativasAsesorEstudiante(evaluacionAsesorId: string) {
  return useQuery({
    queryKey: ['evaluaciones', 'estudiante', 'asesor', evaluacionAsesorId, 'cuantitativas'],
    queryFn: () =>
      evaluacionesService.getEvaluacionesCuantitativasAsesorEstudiante(evaluacionAsesorId),
    enabled: !!evaluacionAsesorId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
