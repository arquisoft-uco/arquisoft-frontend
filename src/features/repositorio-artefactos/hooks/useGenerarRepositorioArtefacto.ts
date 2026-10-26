import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import type { GenerarRepositorioArtefactoRequest } from '../models/GenerarRepositorioArtefactoRequest';

export function useGenerarRepositorioArtefacto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: GenerarRepositorioArtefactoRequest) =>
      repositorioArtefactosService.generarRepositorio(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositorio-artefactos', 'administrador'] });
    },
  });
}
