import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useEstudiantesAsesoradosProyectoGrado(proyectoGradoId: string) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'estudiantes-asesorados'],
    queryFn: () => proyectosGradoService.getEstudiantesAsesorados(proyectoGradoId),
    enabled: !!proyectoGradoId,
  });
}
