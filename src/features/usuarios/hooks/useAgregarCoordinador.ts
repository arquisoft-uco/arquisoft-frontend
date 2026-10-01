import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';

export function useAgregarCoordinador() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (usuarioId) => usuariosService.agregarCoordinador(usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
