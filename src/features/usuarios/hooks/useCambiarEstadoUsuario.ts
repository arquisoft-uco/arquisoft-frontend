import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import type { CambiarEstadoUsuarioRequest } from '../models/CambiarEstadoUsuarioRequest';

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, req }: { usuarioId: string; req: CambiarEstadoUsuarioRequest }) =>
      usuariosService.cambiarEstadoUsuario(usuarioId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
