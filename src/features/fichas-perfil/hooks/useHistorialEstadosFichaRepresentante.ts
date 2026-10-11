import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { ordenarMasRecientePrimero } from '../utils/historial-estados';

export function useHistorialEstadosFichaRepresentante(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'representante-estados'],
    queryFn: () => fichasPerfilService.getEstadosFichaPerfilRepresentante(fichaPerfilId),
    select: ordenarMasRecientePrimero,
    enabled: !!fichaPerfilId,
  });
}
