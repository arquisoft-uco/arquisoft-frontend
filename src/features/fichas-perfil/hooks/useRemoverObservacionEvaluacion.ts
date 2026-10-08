import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useRemoverObservacionEvaluacion(fichaPerfilId: string, evaluacionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fichasPerfilService.removerObservacionEvaluacion,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', fichaPerfilId, 'evaluacion', evaluacionId, 'observaciones'],
      }),
  });
}
