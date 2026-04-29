import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useEstadosFicha() {
  return useQuery({
    queryKey: ['fichas-perfil', 'estados-ficha'],
    queryFn: () => fichasPerfilService.getEstadosFicha(),
    staleTime: Infinity,
  });
}
