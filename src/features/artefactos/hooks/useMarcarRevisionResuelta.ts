import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MarcarRevisionResueltaRequest } from '../models/MarcarRevisionResueltaRequest';
import { artefactosService } from '../services/artefactosService';
import {
  esConObservacionesAbiertas,
  esSinVersionPosterior,
} from '../utils/errores-marcar-revision-resuelta';
import { claveObservacionesRevisionEstudiante } from './useObservacionesRevisionEstudiante';
import { CLAVE_REVISIONES_ESTUDIANTE } from './useRevisionesEstudiante';

export function useMarcarRevisionResuelta() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, MarcarRevisionResueltaRequest>({
    mutationFn: artefactosService.marcarRevisionResuelta,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['artefactos', 'versiones-artefacto'] }),
        queryClient.invalidateQueries({ queryKey: CLAVE_REVISIONES_ESTUDIANTE }),
      ]),
    onError: (err, { revisionAsesorId }) => {
      if (esSinVersionPosterior(err)) return;
      if (esConObservacionesAbiertas(err)) {
        return queryClient.invalidateQueries({
          queryKey: claveObservacionesRevisionEstudiante(revisionAsesorId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'versiones-artefacto'] });
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'estudiante'] });
      queryClient.invalidateQueries({ queryKey: CLAVE_REVISIONES_ESTUDIANTE });
    },
  });
}
