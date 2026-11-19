import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useCerrarObservacionItem(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  function invalidar() {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-observaciones'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-revisiones'],
      }),
    ]);
  }

  return useMutation({
    mutationFn: fichasPerfilService.cerrarObservacionItem,
    onSuccess: invalidar,
    onError: invalidar,
  });
}
