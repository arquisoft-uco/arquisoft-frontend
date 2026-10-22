import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useEvaluacionesAsignadasJurado() {
  return useQuery({
    queryKey: ['evaluaciones', 'jurado', 'asignadas'],
    queryFn: () => evaluacionesService.getEvaluacionesAsignadasJurado(),
    staleTime: 0,
  });
}
