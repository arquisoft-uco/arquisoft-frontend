import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { VersionRepositorioArtefacto } from '../../../shared/models/VersionRepositorioArtefacto';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import { versionYaNoExiste } from '../utils/errores-eliminar-version';

export function useEliminarVersionRepositorio(repositorioId: string) {
  const queryClient = useQueryClient();

  const quitarDeLaCache = (versionId: string) =>
    queryClient.setQueryData<VersionRepositorioArtefacto[]>(
      ['repositorio-artefactos', repositorioId, 'versiones'],
      (versiones) => versiones?.filter((version) => version.id !== versionId),
    );

  return useMutation<void, unknown, string>({
    mutationFn: repositorioArtefactosService.eliminarVersion,
    onSuccess: (_datos, versionId) => quitarDeLaCache(versionId),
    onError: (err, versionId) => {
      if (versionYaNoExiste(err)) quitarDeLaCache(versionId);
    },
  });
}
