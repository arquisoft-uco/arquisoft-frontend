import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';

export function useRemoverCoordinador() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (usuarioId) => usuariosService.removerCoordinador(usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
