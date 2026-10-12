import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { marcarAsesorActual } from '../utils/asesor-actual';

export function useAsesoresProyectoGrado(proyectoGradoId: string | null) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'asesores'],
    queryFn: () => proyectosGradoService.getAsesoresProyecto(proyectoGradoId!),
    enabled: !!proyectoGradoId,
    select: marcarAsesorActual,
  });
}
