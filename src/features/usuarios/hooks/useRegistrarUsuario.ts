import { useMutation } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import type { RegistrarUsuarioRequest } from '../models/RegistrarUsuarioRequest';

export function useRegistrarUsuario() {
  // Cuando exista GET /usuarios: queryClient.invalidateQueries({ queryKey: ['usuarios'] })
  return useMutation({
    mutationFn: (req: RegistrarUsuarioRequest) => usuariosService.registrarUsuario(req),
  });
}
