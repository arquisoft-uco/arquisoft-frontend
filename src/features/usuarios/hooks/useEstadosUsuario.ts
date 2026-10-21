import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';

export function useEstadosUsuario() {
  return useQuery({
    queryKey: ['usuarios', 'estados'],
    queryFn: () => usuariosService.getEstadosUsuario(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
