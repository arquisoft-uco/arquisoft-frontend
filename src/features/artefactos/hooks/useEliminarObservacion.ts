import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { observacionYaNoGestionable } from '../utils/errores-observacion-revision';
import { CLAVE_ELIMINAR_OBSERVACION } from './useObservacionEnEliminacion';

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];

export function useEliminarObservacion() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationKey: CLAVE_ELIMINAR_OBSERVACION,
    mutationFn: artefactosService.eliminarObservacion,
    onError: (err) =>
      observacionYaNoGestionable(err)
        ? Promise.all([
            queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
            queryClient.invalidateQueries({ queryKey: CLAVE_ASESOR }),
          ])
        : undefined,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'revisiones-asesor'] }),
  });
}
