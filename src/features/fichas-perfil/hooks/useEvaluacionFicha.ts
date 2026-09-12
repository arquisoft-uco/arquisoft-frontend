import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useEvaluacionFicha(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['evaluacion-representante', fichaPerfilId],
    queryFn: () => fichasPerfilService.getEvaluacionFicha(fichaPerfilId),
  });
}
