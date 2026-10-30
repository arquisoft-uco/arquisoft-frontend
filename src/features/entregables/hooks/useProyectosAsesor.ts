import { useQuery } from '@tanstack/react-query';
import { entregablesService } from '../services/entregablesService';

export function useProyectosAsesor() {
  return useQuery({
    queryKey: ['entregables', 'proyectos-asesor'],
    queryFn: entregablesService.consultarProyectosAsesor,
  });
}
