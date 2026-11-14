import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entregablesService } from '../services/entregablesService';

export function useCambiarEstadoEntregable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entregableId,
      estadoEntregableId,
    }: {
      entregableId: string;
      estadoEntregableId: string;
    }) => entregablesService.cambiarEstadoEntregable(entregableId, { estadoEntregableId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entregables', 'asesor'] });
      queryClient.invalidateQueries({
        queryKey: ['entregables', variables.entregableId, 'estados'],
      });
    },
  });
}
