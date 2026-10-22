import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useAsignarAsesorProyectoGrado(proyectoGradoId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (asesorId) => proyectosGradoService.asignarAsesor({ proyectoGradoId, asesorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['proyectos-grado', proyectoGradoId, 'asesores'],
      });
    },
  });
}
