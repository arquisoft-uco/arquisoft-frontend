import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Rol } from '../../../shared/models/rol';
import { usuariosService } from '../services/usuariosService';

interface AgregarRolVariables {
  usuarioId: string;
  rol: Rol;
}

export function useAgregarRol() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, AgregarRolVariables>({
    mutationFn: ({ usuarioId, rol }) => usuariosService.agregarRol(usuarioId, rol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
