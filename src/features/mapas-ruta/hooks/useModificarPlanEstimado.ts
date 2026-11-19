import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { ModificarPlanEstimadoRequest } from '../models/ModificarPlanEstimadoRequest';
import { mapasRutaService } from '../services/mapasRutaService';
import { planEstimadoTareaQueryKey } from './usePlanEstimadoTarea';

interface Variables {
  planEstimadoId: string;
  tareaId: string;
  req: ModificarPlanEstimadoRequest;
}

export function useModificarPlanEstimado() {
  const queryClient = useQueryClient();
  const invalidar = (tareaId: string) =>
    queryClient.invalidateQueries({ queryKey: planEstimadoTareaQueryKey(tareaId) });

  return useMutation({
    mutationFn: ({ planEstimadoId, req }: Variables) =>
      mapasRutaService.modificarPlanEstimado(planEstimadoId, req),
    onSuccess: (_data, { tareaId }) => invalidar(tareaId),
    onError: (err: unknown, { tareaId }) => {
      if (hasApiErrorCode(err, 'PLAN_ESTIMADO_NO_ENCONTRADO')) invalidar(tareaId);
    },
  });
}
