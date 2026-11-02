import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MarcarRevisionResueltaRequest } from '../models/MarcarRevisionResueltaRequest';
import { artefactosService } from '../services/artefactosService';
import { esSinVersionPosterior } from '../utils/errores-marcar-revision-resuelta';

export function useMarcarRevisionResuelta() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, MarcarRevisionResueltaRequest>({
    mutationFn: artefactosService.marcarRevisionResuelta,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'versiones-artefacto'] }),
    onError: (err) => {
      if (esSinVersionPosterior(err)) return;
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'versiones-artefacto'] });
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'estudiante'] });
    },
  });
}
