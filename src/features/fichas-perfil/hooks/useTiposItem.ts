import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useTiposItem() {
  return useQuery({
    queryKey: ['fichas-perfil', 'tipos-item'],
    queryFn: fichasPerfilService.consultarTodosTipoItem,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
