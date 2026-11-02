import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import type { AsignarArtefactoRequest } from '../models/AsignarArtefactoRequest';

export function useAsignarArtefacto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: AsignarArtefactoRequest) => artefactosService.asignarArtefacto(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artefactos', 'asesor'] }),
  });
}
