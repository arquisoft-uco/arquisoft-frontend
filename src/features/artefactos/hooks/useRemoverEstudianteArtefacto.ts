import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RemoverEstudianteArtefactoRequest } from '../models/RemoverEstudianteArtefactoRequest';
import { artefactosService } from '../services/artefactosService';

export function useRemoverEstudianteArtefacto() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, RemoverEstudianteArtefactoRequest>({
    mutationFn: artefactosService.removerEstudianteArtefacto,
    onSettled: (_data, _error, req) =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', req.artefactoId, 'estudiantes'] }),
  });
}
