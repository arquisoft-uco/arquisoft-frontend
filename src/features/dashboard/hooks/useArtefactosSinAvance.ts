import { useQuery } from '@tanstack/react-query';
import { DIAS_SIN_AVANCE, dashboardService } from '../services/dashboardService';

export function useArtefactosSinAvance() {
  const query = useQuery({
    queryKey: ['dashboard', 'asesor', 'sin-avance'],
    queryFn: dashboardService.consultarArtefactosSinAvance,
    staleTime: 0,
  });

  return {
    artefactos: query.data?.content ?? [],
    total: query.data?.totalElements,
    dias: DIAS_SIN_AVANCE,
    cargado: query.isSuccess,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}
