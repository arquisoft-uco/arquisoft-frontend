import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export function useObservacionesRevisionEstudiante(revisionAsesorId: string | null) {
  return useQuery({
    queryKey: ['artefactos', 'revisiones-asesor', revisionAsesorId, 'observaciones', 'estudiante'],
    queryFn: () => artefactosService.getObservacionesRevisionEstudiante(revisionAsesorId!),
    enabled: !!revisionAsesorId,
  });
}
