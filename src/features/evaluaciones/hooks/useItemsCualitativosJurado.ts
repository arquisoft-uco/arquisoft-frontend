import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useItemsCualitativosJurado() {
  return useQuery({
    queryKey: ['evaluaciones', 'items-cualitativos-jurado'],
    queryFn: () => evaluacionesService.getItemsCualitativosJurado(),
  });
}
