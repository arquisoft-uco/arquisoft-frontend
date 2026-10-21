import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useAgregarObservacionEvaluacion(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fichasPerfilService.agregarObservacionEvaluacion,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', fichaPerfilId, 'evaluacion'] }),
  });
}
