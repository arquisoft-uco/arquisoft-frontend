import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useAgregarRevisionItem(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fichasPerfilService.agregarRevisionItem,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-revisiones'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-items'],
        }),
      ]),
  });
}
