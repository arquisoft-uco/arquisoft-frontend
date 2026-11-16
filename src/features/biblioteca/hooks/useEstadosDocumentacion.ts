import { useQuery } from '@tanstack/react-query';
import { bibliotecaService } from '../services/bibliotecaService';

export function useEstadosDocumentacion(habilitado: boolean) {
  return useQuery({
    queryKey: ['biblioteca', 'estados-documentacion'],
    queryFn: () => bibliotecaService.getEstadosDocumentacion(),
    enabled: habilitado,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
