import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useItemsFichaCoordinador(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'items-coordinador'],
    queryFn: () => fichasPerfilService.getItemsFichaCoordinador(fichaPerfilId),
    enabled: !!fichaPerfilId,
  });
}
