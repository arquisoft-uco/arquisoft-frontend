import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { mapasRutaService } from '../services/mapasRutaService';
import { planEstimadoTareaQueryKey } from './usePlanEstimadoTarea';

interface Variables {
  planEstimadoId: string;
  tareaId: string;
}

export function useEliminarPlanEstimado() {
  const queryClient = useQueryClient();
  const invalidar = (tareaId: string) =>
    queryClient.invalidateQueries({ queryKey: planEstimadoTareaQueryKey(tareaId) });

  return useMutation({
    mutationFn: ({ planEstimadoId }: Variables) =>
      mapasRutaService.eliminarPlanEstimado(planEstimadoId),
    onSuccess: (_data, { tareaId }) => invalidar(tareaId),
    onError: (err: unknown, { tareaId }) => {
      if (hasApiErrorCode(err, 'PLAN_ESTIMADO_NO_ENCONTRADO')) invalidar(tareaId);
    },
  });
}
