import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useItemsCualitativosAsesor() {
  return useQuery({
    queryKey: ['evaluaciones', 'items-cualitativos-asesor'],
    queryFn: () => evaluacionesService.getItemsCualitativosAsesor(),
  });
}
