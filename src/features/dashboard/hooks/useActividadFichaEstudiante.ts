import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

const CANTIDAD_ESTADOS = 5;

export function useActividadFichaEstudiante(fichaId?: string) {
  const query = useQuery({
    queryKey: ['dashboard', 'estudiante', fichaId, 'estados'],
    queryFn: () => dashboardService.consultarEstadosFichaEstudiante(fichaId ?? ''),
    enabled: !!fichaId,
    staleTime: 0,
  });

  return {
    estados: query.data?.slice(0, CANTIDAD_ESTADOS) ?? [],
    cargado: query.isSuccess,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}
