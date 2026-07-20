import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useItemsFichaRepresentante(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'representante-items'],
    queryFn: () => fichasPerfilService.getItemsFichaRepresentante(fichaPerfilId),
    enabled: !!fichaPerfilId,
  });
}
