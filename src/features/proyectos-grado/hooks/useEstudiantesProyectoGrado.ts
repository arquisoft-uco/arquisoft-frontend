import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useEstudiantesProyectoGrado(proyectoGradoId: string | null) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'estudiantes'],
    queryFn: () => proyectosGradoService.getEstudiantesProyecto(proyectoGradoId!),
    enabled: !!proyectoGradoId,
  });
}
