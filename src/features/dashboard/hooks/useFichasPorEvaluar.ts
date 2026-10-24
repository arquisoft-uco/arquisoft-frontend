import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useFichasPorEvaluar() {
  const query = useQuery({
    queryKey: ['dashboard', 'representante', 'por-evaluar'],
    queryFn: dashboardService.consultarFichasPorEvaluar,
    staleTime: 0,
  });

  return {
    fichas: query.data?.content ?? [],
    totalPorEvaluar: query.data?.totalElements,
    cargado: query.isSuccess,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}
