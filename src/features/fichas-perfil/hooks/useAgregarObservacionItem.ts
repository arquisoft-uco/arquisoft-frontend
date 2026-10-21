import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useAgregarObservacionItem(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fichasPerfilService.agregarObservacionItem,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-observaciones'],
      }),
    onError: () =>
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-revisiones'],
      }),
  });
}
