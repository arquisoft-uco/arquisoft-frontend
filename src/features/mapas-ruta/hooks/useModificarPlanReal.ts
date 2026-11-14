import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { ModificarPlanRealRequest } from '../models/ModificarPlanRealRequest';
import { mapasRutaService } from '../services/mapasRutaService';
import { planRealTareaQueryKey } from './usePlanRealTarea';

interface Variables {
  planRealId: string;
  tareaId: string;
  req: ModificarPlanRealRequest;
}

export function useModificarPlanReal() {
  const queryClient = useQueryClient();
  const invalidar = (tareaId: string) =>
    queryClient.invalidateQueries({ queryKey: planRealTareaQueryKey(tareaId) });

  return useMutation({
    mutationFn: ({ planRealId, req }: Variables) =>
      mapasRutaService.modificarPlanReal(planRealId, req),
    onSuccess: (_data, { tareaId }) => invalidar(tareaId),
    onError: (err: unknown, { tareaId }) => {
      if (hasApiErrorCode(err, 'PLAN_REAL_NO_ENCONTRADO')) invalidar(tareaId);
    },
  });
}
