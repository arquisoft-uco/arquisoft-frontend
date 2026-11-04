import { useQuery } from '@tanstack/react-query';
import { mapasRutaService } from '../services/mapasRutaService';

export function useAsesoresProyecto(proyectoGradoId: string | undefined) {
  return useQuery({
    queryKey: ['mapas-ruta', 'proyecto', proyectoGradoId, 'asesores-asignados'],
    queryFn: () => mapasRutaService.consultarAsesoresProyecto(proyectoGradoId!),
    enabled: !!proyectoGradoId,
  });
}
