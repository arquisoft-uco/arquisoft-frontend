import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useAsesoresProyectoGrado(proyectoGradoId: string | null) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'asesores'],
    queryFn: () => proyectosGradoService.getAsesoresProyecto(proyectoGradoId!),
    enabled: !!proyectoGradoId,
  });
}
