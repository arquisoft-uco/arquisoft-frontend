import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useFichaDelEstudiante() {
  const query = useQuery({
    queryKey: ['dashboard', 'estudiante', 'fichas'],
    queryFn: dashboardService.consultarFichasEstudiante,
    staleTime: 0,
  });

  return {
    ficha: query.data?.[0],
    totalFichas: query.data?.length ?? 0,
    cargado: query.isSuccess,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}
