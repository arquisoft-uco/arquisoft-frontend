import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { ordenarMasRecientePrimero } from '../utils/historial-estados';

export function useHistorialEstadosFichaCoordinador(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'estados-coordinador'],
    queryFn: () => fichasPerfilService.getEstadosFichaPerfilCoordinador(fichaPerfilId),
    select: ordenarMasRecientePrimero,
    enabled: !!fichaPerfilId,
  });
}
