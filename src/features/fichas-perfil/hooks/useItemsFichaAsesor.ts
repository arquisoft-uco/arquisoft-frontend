import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useItemsFichaAsesor(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-items'],
    queryFn: () => fichasPerfilService.getItemsFichaAsesor(fichaPerfilId),
    enabled: !!fichaPerfilId,
  });
}
