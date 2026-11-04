import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export function useObservacionesRevision(revisionAsesorId: string | null) {
  return useQuery({
    queryKey: ['artefactos', 'revisiones-asesor', revisionAsesorId, 'observaciones'],
    queryFn: () => artefactosService.getObservacionesRevision(revisionAsesorId!),
    enabled: !!revisionAsesorId,
  });
}
