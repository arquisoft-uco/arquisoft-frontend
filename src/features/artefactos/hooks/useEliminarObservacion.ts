import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { artefactosService } from '../services/artefactosService';
import {
  OBSERVACION_NO_ENCONTRADA,
  observacionYaNoGestionable,
} from '../utils/errores-observacion-revision';

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];

interface Variables {
  observacionId: string;
  revisionAsesorId: string;
}

export function useEliminarObservacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ observacionId }: Variables) =>
      artefactosService.eliminarObservacion(observacionId),
    onSuccess: (_data, { revisionAsesorId }) =>
      queryClient.invalidateQueries({
        queryKey: ['artefactos', 'revisiones-asesor', revisionAsesorId, 'observaciones'],
      }),
    onError: (err, { revisionAsesorId }) => {
      const claveObservaciones = [
        'artefactos',
        'revisiones-asesor',
        revisionAsesorId,
        'observaciones',
      ];
      if (observacionYaNoGestionable(err)) {
        return Promise.all([
          queryClient.invalidateQueries({ queryKey: claveObservaciones }),
          queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
          queryClient.invalidateQueries({ queryKey: CLAVE_ASESOR }),
        ]);
      }
      if (hasApiErrorCode(err, OBSERVACION_NO_ENCONTRADA)) {
        return queryClient.invalidateQueries({ queryKey: claveObservaciones });
      }
    },
  });
}
