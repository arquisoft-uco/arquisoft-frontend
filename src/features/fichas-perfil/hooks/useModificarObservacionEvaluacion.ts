import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useModificarObservacionEvaluacion(fichaPerfilId: string, evaluacionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fichasPerfilService.modificarObservacionEvaluacion,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', fichaPerfilId, 'evaluacion', evaluacionId, 'observaciones'],
      }),
  });
}
