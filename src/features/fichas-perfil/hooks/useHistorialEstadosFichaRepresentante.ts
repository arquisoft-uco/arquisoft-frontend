import { useQuery } from '@tanstack/react-query';
import type { HistorialEstadoFichaPerfil } from '../models/HistorialEstadoFichaPerfil';
import { fichasPerfilService } from '../services/fichasPerfilService';

function marcaDeTiempo(fecha: string): number {
  const marca = Date.parse(fecha);
  return Number.isNaN(marca) ? 0 : marca;
}

function ordenarMasRecientePrimero(
  historial: HistorialEstadoFichaPerfil[],
): HistorialEstadoFichaPerfil[] {
  return [...historial].sort(
    (a, b) => marcaDeTiempo(b.fechaActualizacion) - marcaDeTiempo(a.fechaActualizacion),
  );
}

export function useHistorialEstadosFichaRepresentante(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'representante-estados'],
    queryFn: () => fichasPerfilService.getEstadosFichaPerfilRepresentante(fichaPerfilId),
    select: ordenarMasRecientePrimero,
    enabled: !!fichaPerfilId,
  });
}
