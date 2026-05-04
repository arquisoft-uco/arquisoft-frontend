import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useRegistrarEvaluacion(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fichasPerfilService.registrarEvaluacion({ fichaPerfilId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluacion-representante', fichaPerfilId] });
    },
  });
}
