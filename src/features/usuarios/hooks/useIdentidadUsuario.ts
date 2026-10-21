import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';

export function useIdentidadUsuario(usuarioId: string) {
  return useQuery({
    queryKey: ['usuarios', 'identidad', usuarioId],
    queryFn: () => usuariosService.consultarIdentidadUsuario(usuarioId),
    enabled: !!usuarioId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
