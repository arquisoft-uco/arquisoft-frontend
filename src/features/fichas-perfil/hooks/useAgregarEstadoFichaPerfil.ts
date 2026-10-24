import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useAgregarEstadoFichaPerfil(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estadoFichaId: string) =>
      fichasPerfilService.agregarEstadoFichaPerfil(fichaPerfilId, { estadoFichaId }),
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
