import { useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

export function useTiposSolicitud() {
  return useQuery({
    queryKey: ['solicitudes', 'tipos-solicitud'],
    queryFn: () => solicitudesService.getTiposSolicitud(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
