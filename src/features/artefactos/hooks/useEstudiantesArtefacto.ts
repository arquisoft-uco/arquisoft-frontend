import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export function useEstudiantesArtefacto(artefactoId: string | null) {
  return useQuery({
    queryKey: ['artefactos', artefactoId, 'estudiantes'],
    queryFn: () => artefactosService.getEstudiantesArtefacto(artefactoId!),
    enabled: !!artefactoId,
  });
}
