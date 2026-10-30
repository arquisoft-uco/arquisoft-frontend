import { useQuery } from '@tanstack/react-query';
import { entregablesService } from '../services/entregablesService';

export function useArtefactosEntregable(entregableId: string) {
  return useQuery({
    queryKey: ['entregables', entregableId, 'artefactos'],
    queryFn: () => entregablesService.consultarArtefactosEntregable(entregableId),
  });
}
