import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useFichasAsesoradas() {
  const query = useQuery({
    queryKey: ['dashboard', 'asesor-ficha', 'fichas'],
    queryFn: dashboardService.consultarFichasAsesoradas,
    staleTime: 0,
  });

  return {
    fichas: query.data?.content ?? [],
    total: query.data?.totalElements,
    cargado: query.isSuccess,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}
