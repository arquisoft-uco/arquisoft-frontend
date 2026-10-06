import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useTotalFichas() {
  const query = useQuery({
    queryKey: ['dashboard', 'representante', 'total-fichas'],
    queryFn: dashboardService.contarFichas,
    staleTime: 0,
  });

  return {
    total: query.data,
    cargado: query.isSuccess,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}
