import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { AportarPlanRealRequest } from '../models/AportarPlanRealRequest';
import { mapasRutaService } from '../services/mapasRutaService';
import { planesRealesProyectoAsesorQueryKey } from './usePlanesRealesProyectoAsesor';

interface Variables {
  planRealId: string;
  req: AportarPlanRealRequest;
}

export function useAportarPlanReal(proyectoGradoId: string) {
  const queryClient = useQueryClient();
  const invalidar = () =>
    queryClient.invalidateQueries({
      queryKey: planesRealesProyectoAsesorQueryKey(proyectoGradoId),
    });

  return useMutation({
    mutationFn: ({ planRealId, req }: Variables) =>
      mapasRutaService.aportarPlanReal(planRealId, req),
    onSuccess: invalidar,
    onError: (err: unknown) => {
      if (hasApiErrorCode(err, 'PLAN_REAL_NO_ENCONTRADO')) invalidar();
    },
  });
}
