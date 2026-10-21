import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useAsignarEstudiantesProyectoGrado(proyectoGradoId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string[]>({
    mutationFn: (estudiantesIds) =>
      proyectosGradoService.asignarEstudiantes({ proyectoGradoId, estudiantesIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['proyectos-grado', proyectoGradoId, 'estudiantes'],
      });
    },
  });
}
