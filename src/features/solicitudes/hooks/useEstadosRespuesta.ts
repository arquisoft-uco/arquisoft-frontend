import { useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

export function useEstadosRespuesta() {
  return useQuery({
    queryKey: ['solicitudes', 'estados-respuesta'],
    queryFn: () => solicitudesService.getEstadosRespuesta(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
