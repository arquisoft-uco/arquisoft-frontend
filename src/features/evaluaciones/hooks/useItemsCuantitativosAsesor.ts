import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useItemsCuantitativosAsesor() {
  return useQuery({
    queryKey: ['evaluaciones', 'items-cuantitativos-asesor'],
    queryFn: () => evaluacionesService.getItemsCuantitativosAsesor(),
  });
}
