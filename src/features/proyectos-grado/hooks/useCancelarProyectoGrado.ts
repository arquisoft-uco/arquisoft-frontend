import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CancelarProyectoGradoRequest } from '../models/CancelarProyectoGradoRequest';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useCancelarProyectoGrado() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, CancelarProyectoGradoRequest>({
    mutationFn: (req) => proyectosGradoService.cancelarProyecto(req),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos-grado'] });
    },
  });
}
