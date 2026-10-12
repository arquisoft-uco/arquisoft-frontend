import { useMemo } from 'react';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useItemsFichaAsesor } from './useItemsFichaAsesor';
import { useObservacionesPaginadas } from './useObservacionesPaginadas';
import { useRevisionesPorItemAsesor } from './useRevisionesPorItemAsesor';

export function useObservacionesFichaAsesor(fichaPerfilId: string) {
  const itemsQuery = useItemsFichaAsesor(fichaPerfilId);
  const revisionesPorItem = useRevisionesPorItemAsesor(fichaPerfilId);
  const { revisionPorItem } = revisionesPorItem;

  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);
  const revisiones = useMemo(() => [...revisionPorItem.values()], [revisionPorItem]);

  const { refetch, ...observaciones } = useObservacionesPaginadas({
    claveQuery: ['fichas-perfil', fichaPerfilId, 'asesor-observaciones'],
    items,
    itemsCargados: itemsQuery.isSuccess,
    revisiones,
    revisionesCargadas: revisionesPorItem.isSuccess,
    consultar: fichasPerfilService.consultarObservacionesItemAsesor,
  });

  function reintentar() {
    if (itemsQuery.isError) void itemsQuery.refetch();
    if (revisionesPorItem.isError) void revisionesPorItem.refetch();
    if (observaciones.isError) void refetch();
  }

  return {
    ...observaciones,
    isLoading: itemsQuery.isLoading || revisionesPorItem.isLoading || observaciones.isLoading,
    isError: itemsQuery.isError || revisionesPorItem.isError || observaciones.isError,
    error: itemsQuery.error ?? observaciones.error,
    reintentar,
  };
}
