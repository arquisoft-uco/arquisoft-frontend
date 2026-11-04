import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import type { ModificarRepositorioArtefactoRequest } from '../models/ModificarRepositorioArtefactoRequest';
import { hasApiErrorCode } from '../../../shared/utils/api-error';

interface Variables {
  repositorioId: string;
  req: ModificarRepositorioArtefactoRequest;
}

export function useModificarRepositorioArtefacto() {
  const queryClient = useQueryClient();
  const invalidarListado = () =>
    queryClient.invalidateQueries({ queryKey: ['repositorio-artefactos', 'administrador'] });

  return useMutation({
    mutationFn: ({ repositorioId, req }: Variables) =>
      repositorioArtefactosService.modificarRepositorio(repositorioId, req),
    onSuccess: invalidarListado,
    onError: (err: unknown) => {
      if (hasApiErrorCode(err, 'REPOSITORIO_ARTEFACTO_NO_ENCONTRADO')) invalidarListado();
    },
  });
}
