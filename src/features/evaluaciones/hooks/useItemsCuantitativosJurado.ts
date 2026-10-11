import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useItemsCuantitativosJurado() {
  return useQuery({
    queryKey: ['evaluaciones', 'items-cuantitativos-jurado'],
    queryFn: () => evaluacionesService.getItemsCuantitativosJurado(),
  });
}
