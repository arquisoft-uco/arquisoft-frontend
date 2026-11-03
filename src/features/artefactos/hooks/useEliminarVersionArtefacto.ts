import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ESTUDIANTE = ['artefactos', 'estudiante'];

export function useEliminarVersionArtefacto() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: artefactosService.eliminarVersionArtefacto,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
        queryClient.invalidateQueries({ queryKey: CLAVE_ESTUDIANTE }),
      ]),
    onError: () => queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
  });
}
