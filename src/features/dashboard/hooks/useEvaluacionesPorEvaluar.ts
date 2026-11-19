import { useQuery } from '@tanstack/react-query';
import { ESTADO_JURADO_POR_EVALUAR, dashboardService } from '../services/dashboardService';

export function useEvaluacionesPorEvaluar() {
  const query = useQuery({
    queryKey: ['dashboard', 'jurado', 'por-evaluar'],
    queryFn: dashboardService.consultarEvaluacionesPorEvaluar,
    staleTime: 0,
  });

  return {
    evaluaciones: query.data?.content ?? [],
    total: query.data?.totalElements,
    estadoPorEvaluar: ESTADO_JURADO_POR_EVALUAR,
    cargado: query.isSuccess,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}
