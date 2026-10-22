import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useCompanerosProyectoGrado(proyectoGradoId: string | null) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'companeros'],
    queryFn: () => proyectosGradoService.getCompanerosProyecto(proyectoGradoId!),
    enabled: !!proyectoGradoId,
  });
}
