import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useObservacionesEvaluacionCoordinador(fichaPerfilId: string, evaluacionId: string) {
  const { data, isLoading, isError, isSuccess, error, refetch } = useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'observaciones-coordinador'],
    queryFn: () =>
      fichasPerfilService.consultarObservacionesEvaluacionesFichaCoordinador(fichaPerfilId),
    enabled: !!fichaPerfilId,
    select: (todas) => todas.filter((o) => o.evaluacionFichaPerfilId === evaluacionId),
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
