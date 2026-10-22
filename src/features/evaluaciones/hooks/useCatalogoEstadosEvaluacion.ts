import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useCatalogoEstadosEvaluacion() {
  return useQuery({
    queryKey: ['evaluaciones', 'estados-evaluacion'],
    queryFn: () => evaluacionesService.getEstadosEvaluacion(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
