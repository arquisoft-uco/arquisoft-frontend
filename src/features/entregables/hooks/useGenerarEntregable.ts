import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entregablesService } from '../services/entregablesService';

export function useGenerarEntregable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proyectoGradoId: string) => entregablesService.generarEntregable(proyectoGradoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregables', 'asesor'] });
    },
  });
}
