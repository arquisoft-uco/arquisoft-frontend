import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useEntregablesPorPublicar() {
  const query = useQuery({
    queryKey: ['dashboard', 'bibliotecario', 'por-publicar'],
    queryFn: dashboardService.consultarEntregablesPorPublicar,
    staleTime: 0,
  });

  return {
    entregables: query.data?.content ?? [],
    total: query.data?.totalElements,
    cargado: query.isSuccess,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}
