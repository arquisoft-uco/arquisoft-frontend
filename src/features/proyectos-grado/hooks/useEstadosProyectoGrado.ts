import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { ordenarMasRecientePrimero } from '../utils/historial-estados';

export function useEstadosProyectoGrado(proyectoGradoId: string) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'estados'],
    queryFn: () => proyectosGradoService.getEstadosProyecto(proyectoGradoId),
    enabled: !!proyectoGradoId,
    select: ordenarMasRecientePrimero,
  });
}
