import { useQuery } from '@tanstack/react-query';
import {
  consultarEvaluacionesMiFichaPerfil,
  consultarObservacionesEvaluacionMiFichaPerfil,
} from '../services/fichasPerfilMockService';

export function useEvaluacionesMiFicha() {
  const evaluacionesQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'evaluaciones'],
    queryFn: consultarEvaluacionesMiFichaPerfil,
  });

  const observacionesQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'observaciones-evaluacion'],
    queryFn: consultarObservacionesEvaluacionMiFichaPerfil,
  });

  return {
    evaluaciones: evaluacionesQuery.data ?? [],
    observacionesEvaluacion: observacionesQuery.data ?? [],
    isLoading: evaluacionesQuery.isLoading || observacionesQuery.isLoading,
    isError: evaluacionesQuery.isError || observacionesQuery.isError,
  };
}
