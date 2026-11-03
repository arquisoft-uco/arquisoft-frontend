import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export const claveObservacionesRevisionEstudiante = (revisionAsesorId: string | null) => [
  'artefactos',
  'revisiones-asesor',
  revisionAsesorId,
  'observaciones',
  'estudiante',
];

export function useObservacionesRevisionEstudiante(revisionAsesorId: string | null) {
  return useQuery({
    queryKey: claveObservacionesRevisionEstudiante(revisionAsesorId),
    queryFn: () => artefactosService.getObservacionesRevisionEstudiante(revisionAsesorId!),
    enabled: !!revisionAsesorId,
  });
}
