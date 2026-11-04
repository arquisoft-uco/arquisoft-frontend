import { useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

export function useTiposSolicitudRecibidas() {
  return useQuery({
    queryKey: ['solicitudes', 'tipos-solicitud', 'recibidas'],
    queryFn: () => solicitudesService.getTiposSolicitudRecibidas(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
