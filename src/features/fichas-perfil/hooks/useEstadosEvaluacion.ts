import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useEstadosEvaluacion() {
  return useQuery({
    queryKey: ['estados-evaluacion'],
    queryFn: () => fichasPerfilService.getEstadosEvaluacion(),
    staleTime: Infinity,
  });
}
