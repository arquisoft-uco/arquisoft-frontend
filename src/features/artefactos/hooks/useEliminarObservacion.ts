import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export function useEliminarObservacion() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: artefactosService.eliminarObservacion,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', 'revisiones-asesor'] }),
  });
}
