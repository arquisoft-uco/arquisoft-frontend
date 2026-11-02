import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CambiarEstadoObservacionRequest } from '../models/CambiarEstadoObservacionRequest';
import { artefactosService } from '../services/artefactosService';
import { decisionObservacionYaNoAplica } from '../utils/errores-cambiar-estado-observacion';

const CLAVE_REVISIONES = ['artefactos', 'revisiones-asesor'];
const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];

interface Variables extends CambiarEstadoObservacionRequest {
  observacionId: string;
  revisionAsesorId: string;
}

export function useCambiarEstadoObservacion() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, Variables>({
    mutationFn: ({ observacionId, estado }) =>
      artefactosService.cambiarEstadoObservacion(observacionId, { estado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_REVISIONES }),
    onError: (err, { revisionAsesorId }) => {
      if (decisionObservacionYaNoAplica(err)) {
        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...CLAVE_REVISIONES, revisionAsesorId, 'observaciones'],
          }),
          queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
          queryClient.invalidateQueries({ queryKey: CLAVE_ASESOR }),
        ]);
      }
    },
  });
}
