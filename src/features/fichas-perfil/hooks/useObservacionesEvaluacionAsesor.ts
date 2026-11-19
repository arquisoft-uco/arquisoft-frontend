import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useObservacionesEvaluacionAsesor(fichaPerfilId: string, evaluacionId: string) {
  const { data, isLoading, isError, isSuccess, error, refetch } = useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'evaluacion', evaluacionId, 'observaciones-asesor'],
    queryFn: () => fichasPerfilService.consultarObservacionesEvaluacionAsesor(evaluacionId),
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
