import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useEvaluacionFicha(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'evaluacion'],
    queryFn: () => fichasPerfilService.getEvaluacionFicha(fichaPerfilId),
  });
}
