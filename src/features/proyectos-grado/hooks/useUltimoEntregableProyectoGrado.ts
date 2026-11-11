import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useUltimoEntregableProyectoGrado(proyectoGradoId: string) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'ultimo-entregable'],
    queryFn: () => proyectosGradoService.consultarUltimoEntregable(proyectoGradoId),
    enabled: !!proyectoGradoId,
    staleTime: 0,
  });
}
