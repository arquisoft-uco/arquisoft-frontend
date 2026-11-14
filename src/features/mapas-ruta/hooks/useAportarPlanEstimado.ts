import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { AportarPlanEstimadoRequest } from '../models/AportarPlanEstimadoRequest';
import { mapasRutaService } from '../services/mapasRutaService';
import { planesEstimadosProyectoAsesorQueryKey } from './usePlanesEstimadosProyectoAsesor';

interface Variables {
  planEstimadoId: string;
  req: AportarPlanEstimadoRequest;
}

export function useAportarPlanEstimado(proyectoGradoId: string) {
  const queryClient = useQueryClient();
  const invalidar = () =>
    queryClient.invalidateQueries({
      queryKey: planesEstimadosProyectoAsesorQueryKey(proyectoGradoId),
    });

  return useMutation({
    mutationFn: ({ planEstimadoId, req }: Variables) =>
      mapasRutaService.aportarPlanEstimado(planEstimadoId, req),
    onSuccess: invalidar,
    onError: (err: unknown) => {
      if (hasApiErrorCode(err, 'PLAN_ESTIMADO_NO_ENCONTRADO')) invalidar();
    },
  });
}
