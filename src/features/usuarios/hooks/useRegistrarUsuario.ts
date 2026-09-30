import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import type { RegistrarUsuarioRequest } from '../models/RegistrarUsuarioRequest';

export function useRegistrarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegistrarUsuarioRequest) => usuariosService.registrarUsuario(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
