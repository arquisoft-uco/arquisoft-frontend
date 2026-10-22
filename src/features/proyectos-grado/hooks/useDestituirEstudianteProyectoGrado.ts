import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useDestituirEstudianteProyectoGrado(proyectoGradoId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (estudianteId) =>
      proyectosGradoService.destituirEstudiante({ proyectoGradoId, estudianteId }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['proyectos-grado', proyectoGradoId, 'estudiantes'],
      });
    },
  });
}
