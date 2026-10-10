import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useAgregarEstadoAprobacionFichaPerfil(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (acepta: boolean) =>
      fichasPerfilService.agregarEstadoAprobacionFichaPerfil(fichaPerfilId, { acepta }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil'],
        predicate: (query) => {
          const key = query.queryKey as string[];

          // El catálogo de estados es cerrado: no se refetch
          return !(key[0] === 'fichas-perfil' && key[1] === 'estados-ficha');
        },
      });
    },
  });
}
