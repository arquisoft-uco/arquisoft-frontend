import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { EvaluacionFichaPerfil } from '../models/fichas-perfil';

export function useEvaluacionFicha(fichaPerfilId: string) {
  return useQuery<EvaluacionFichaPerfil | undefined>({
    queryKey: ['evaluacion-representante', fichaPerfilId],
    queryFn: async () => {
      try {
        return await fichasPerfilService.getEvaluacionFicha(fichaPerfilId);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          return undefined;
        }
        throw err;
      }
    },
  });
}
