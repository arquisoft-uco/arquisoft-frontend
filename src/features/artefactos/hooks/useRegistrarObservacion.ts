import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { observacionYaNoGestionable } from '../utils/errores-observacion-revision';

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];

interface Variables {
  revisionAsesorId: string;
  descripcion: string;
}

export function useRegistrarObservacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ revisionAsesorId, descripcion }: Variables) =>
      artefactosService.registrarObservacion(revisionAsesorId, { descripcion }),
    onSuccess: (_data, { revisionAsesorId }) =>
      queryClient.invalidateQueries({
        queryKey: ['artefactos', 'revisiones-asesor', revisionAsesorId, 'observaciones'],
      }),
    onError: (err, { revisionAsesorId }) => {
      if (observacionYaNoGestionable(err)) {
        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['artefactos', 'revisiones-asesor', revisionAsesorId, 'observaciones'],
          }),
          queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
          queryClient.invalidateQueries({ queryKey: CLAVE_ASESOR }),
        ]);
      }
    },
  });
}
