import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const REINTENTOS_MAXIMOS = 3;

export const OBSERVACIONES_ITEM_JURADO_KEY = ['evaluaciones', 'jurado', 'observaciones-item'];

export function useObservacionesItemJurado(evaluacionCuantitativaJuradoId: string) {
  return useQuery({
    queryKey: [...OBSERVACIONES_ITEM_JURADO_KEY, evaluacionCuantitativaJuradoId],
    queryFn: () => evaluacionesService.getObservacionesItemJurado(evaluacionCuantitativaJuradoId),
    enabled: !!evaluacionCuantitativaJuradoId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
