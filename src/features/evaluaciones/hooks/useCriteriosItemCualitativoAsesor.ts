import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useCriteriosItemCualitativoAsesor() {
  return useQuery({
    queryKey: ['evaluaciones', 'criterios-item-cualitativo-asesor'],
    queryFn: () => evaluacionesService.getCriteriosItemCualitativoAsesor(),
  });
}
