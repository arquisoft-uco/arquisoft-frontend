import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export function useEstadosRevisionAsesor() {
  return useQuery({
    queryKey: ['artefactos', 'estados-revision-asesor'],
    queryFn: () => artefactosService.getEstadosRevisionAsesor(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
