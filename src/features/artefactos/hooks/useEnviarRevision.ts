import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { revisionSinObservaciones, revisionYaNoEnviable } from '../utils/errores-enviar-revision';

interface Variables {
  revisionAsesorId: string;
}

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];

function claveObservaciones(revisionAsesorId: string) {
  return ['artefactos', 'revisiones-asesor', revisionAsesorId, 'observaciones'];
}

export function useEnviarRevision() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, Variables>({
    mutationFn: ({ revisionAsesorId }) => artefactosService.enviarRevision(revisionAsesorId),
    onSuccess: (_datos, { revisionAsesorId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
        queryClient.invalidateQueries({ queryKey: claveObservaciones(revisionAsesorId) }),
      ]),
    onError: (err, { revisionAsesorId }) => {
      if (revisionYaNoEnviable(err)) {
        return Promise.all([
          queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
          queryClient.invalidateQueries({ queryKey: claveObservaciones(revisionAsesorId) }),
          queryClient.invalidateQueries({ queryKey: CLAVE_ASESOR }),
        ]);
      }
      if (revisionSinObservaciones(err)) {
        return queryClient.invalidateQueries({ queryKey: claveObservaciones(revisionAsesorId) });
      }
    },
  });
}
