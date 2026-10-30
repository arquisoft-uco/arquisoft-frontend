import { useQuery } from '@tanstack/react-query';
import { mapasRutaService } from '../services/mapasRutaService';

export function useEstadosTarea() {
  return useQuery({
    queryKey: ['mapas-ruta', 'estados-item'],
    queryFn: mapasRutaService.consultarEstadosTarea,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
