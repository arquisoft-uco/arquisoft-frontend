import { useQuery } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { marcarAsesorActual } from '../utils/asesor-actual';

export function useAsesoresAsignadosProyectoGrado(proyectoGradoId: string | null) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'asesores-asignados'],
    queryFn: () => proyectosGradoService.getAsesoresAsignadosProyecto(proyectoGradoId!),
    enabled: !!proyectoGradoId,
    select: marcarAsesorActual,
  });
}
