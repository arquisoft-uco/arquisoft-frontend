import { useQuery } from '@tanstack/react-query';
import { entregablesService } from '../services/entregablesService';

export function useEstadosEntregable() {
  return useQuery({
    queryKey: ['entregables', 'estados-entregable'],
    queryFn: () => entregablesService.getEstadosEntregable(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
