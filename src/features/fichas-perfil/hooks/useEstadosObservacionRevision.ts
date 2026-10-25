import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useEstadosObservacionRevision() {
  return useQuery({
    queryKey: ['fichas-perfil', 'estados-observacion-revision'],
    queryFn: () => fichasPerfilService.getEstadosObservacionRevision(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
