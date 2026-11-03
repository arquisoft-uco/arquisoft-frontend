import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MarcarRevisionResueltaRequest } from '../models/MarcarRevisionResueltaRequest';
import { artefactosService } from '../services/artefactosService';
import {
  esConObservacionesAbiertas,
  esSinVersionPosterior,
} from '../utils/errores-marcar-revision-resuelta';
import { claveObservacionesRevisionEstudiante } from './useObservacionesRevisionEstudiante';

export function useMarcarRevisionResuelta() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, MarcarRevisionResueltaRequest>({
    mutationFn: artefactosService.marcarRevisionResuelta,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'versiones-artefacto'] }),
    onError: (err, { revisionAsesorId }) => {
      if (esSinVersionPosterior(err)) return;
      if (esConObservacionesAbiertas(err)) {
        return queryClient.invalidateQueries({
          queryKey: claveObservacionesRevisionEstudiante(revisionAsesorId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'versiones-artefacto'] });
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'estudiante'] });
    },
  });
}
