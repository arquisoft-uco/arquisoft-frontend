import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useCriteriosItemCualitativoJurado() {
  return useQuery({
    queryKey: ['evaluaciones', 'criterios-item-cualitativo-jurado'],
    queryFn: () => evaluacionesService.getCriteriosItemCualitativoJurado(),
  });
}
