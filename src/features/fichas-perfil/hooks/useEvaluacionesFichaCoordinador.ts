import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useEvaluacionesFichaCoordinador(fichaPerfilId: string | null) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'evaluaciones-coordinador'],
    queryFn: () => fichasPerfilService.consultarEvaluacionesFichaCoordinador(fichaPerfilId!),
    enabled: !!fichaPerfilId,
  });
}
