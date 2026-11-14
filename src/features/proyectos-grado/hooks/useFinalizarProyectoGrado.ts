import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FinalizarProyectoGradoRequest } from '../models/FinalizarProyectoGradoRequest';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useFinalizarProyectoGrado() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, FinalizarProyectoGradoRequest>({
    mutationFn: (req) => proyectosGradoService.finalizarProyecto(req),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos-grado'] });
    },
  });
}
