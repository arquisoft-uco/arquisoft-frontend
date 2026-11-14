import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entregablesService } from '../services/entregablesService';

export function useGenerarEntregable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proyectoGradoId: string) => entregablesService.generarEntregable(proyectoGradoId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['entregables', 'asesor'] });
      queryClient.invalidateQueries({
        queryKey: ['entregables', 'proyectos-con-entregable-vigente'],
      });
      queryClient.invalidateQueries({ queryKey: ['entregables', 'vista-previa-paquete'] });
    },
  });
}
