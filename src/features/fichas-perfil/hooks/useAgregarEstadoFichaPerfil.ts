import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useAgregarEstadoFichaPerfil(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estadoFichaId: string) =>
      fichasPerfilService.agregarEstadoFichaPerfil({ fichaPerfilId, estadoFichaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil'],
        predicate: (query) => {
          const key = (query.queryKey ?? []) as string[];

          // Mantener en caché el catálogo 'estados-ficha' (no refetch)
          if (key[0] === 'fichas-perfil' && key[1] === 'estados-ficha') return false;

          // Mantener en caché la consulta 'mi-ficha' del estudiante para evitar
          // refetch cuando el usuario actual es el estudiante. Evitamos llamadas
          // innecesarias porque actualizamos esa caché localmente con setQueryData.
          if (
            key[0] === 'fichas-perfil' &&
            key[1] === 'estudiante' &&
            key[key.length - 1] === 'mi-ficha'
          )
            return false;

          // Invalidar todo lo demás bajo 'fichas-perfil'
          return true;
        },
      });
    },
  });
}
