import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CambiarAsesorArtefactoRequest } from '../models/CambiarAsesorArtefactoRequest';
import { artefactosService } from '../services/artefactosService';

export function useCambiarAsesorArtefacto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CambiarAsesorArtefactoRequest) =>
      artefactosService.cambiarAsesorArtefacto(req),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'asesor', 'artefactos-asignados'] }),
  });
}
