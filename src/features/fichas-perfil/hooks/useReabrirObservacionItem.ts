import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useReabrirObservacionItem(fichaPerfilId: string) {
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
    mutationFn: fichasPerfilService.reabrirObservacionItem,
    onSuccess: invalidar,
    onError: invalidar,
  });
}
