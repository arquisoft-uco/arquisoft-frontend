import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { entregablesService } from '../services/entregablesService';
import { ordenarMasRecientePrimero } from '../utils/historial-estados';

const REINTENTOS_MAXIMOS = 3;

export function useHistorialEstadosEntregable(entregableId: string) {
  return useQuery({
    queryKey: ['entregables', entregableId, 'estados'],
    queryFn: () => entregablesService.consultarHistorialEstadosEntregable(entregableId),
    enabled: !!entregableId,
    select: ordenarMasRecientePrimero,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
