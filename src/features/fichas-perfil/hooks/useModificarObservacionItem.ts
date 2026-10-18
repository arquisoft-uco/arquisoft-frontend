import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useModificarObservacionItem(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fichasPerfilService.modificarObservacionItem,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-observaciones'],
      }),
    onError: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-revisiones'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-observaciones'],
        }),
      ]),
  });
}
