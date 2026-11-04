import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';

export function useEstadosAsesorProyectoGrado() {
  return useQuery({
    queryKey: ['proyectos-grado', 'estados-asesor'],
    queryFn: () => proyectosGradoService.getEstadosAsesor(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
