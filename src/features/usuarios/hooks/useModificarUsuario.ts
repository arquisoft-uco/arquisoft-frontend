import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import type { ModificarUsuarioRequest } from '../models/ModificarUsuarioRequest';

export function useModificarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, req }: { usuarioId: string; req: ModificarUsuarioRequest }) =>
      usuariosService.modificarUsuario(usuarioId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
