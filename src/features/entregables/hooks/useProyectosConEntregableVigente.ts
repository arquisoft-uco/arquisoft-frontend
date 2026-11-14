import { useQuery } from '@tanstack/react-query';
import { entregablesService } from '../services/entregablesService';

const STALE_TIME_VIGENTES = 30 * 1000;

export function useProyectosConEntregableVigente() {
  return useQuery({
    queryKey: ['entregables', 'proyectos-con-entregable-vigente'],
    queryFn: entregablesService.consultarProyectosConEntregableVigente,
    staleTime: STALE_TIME_VIGENTES,
  });
}
