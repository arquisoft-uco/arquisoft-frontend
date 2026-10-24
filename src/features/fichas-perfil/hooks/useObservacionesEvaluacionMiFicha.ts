import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useObservacionesEvaluacionMiFicha(fichaPerfilId: string, evaluacionId: string) {
  const { data, isLoading, isError, isSuccess, error, refetch } = useQuery({
    queryKey: [
      'fichas-perfil',
      'estudiante',
      fichaPerfilId,
      'evaluaciones',
      evaluacionId,
      'observaciones',
    ],
    queryFn: () => fichasPerfilService.consultarObservacionesEvaluacionMiFicha(evaluacionId),
    enabled: !!evaluacionId,
  });

  return {
    observaciones: data ?? [],
    isLoading,
    cargado: isSuccess,
    isError,
    error,
    refetch,
  };
}
