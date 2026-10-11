import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ObservacionItemFila } from '../models/ObservacionItem';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useItemsFichaAsesor } from './useItemsFichaAsesor';
import type { DireccionOrden } from './useRevisionesPaginadas';
import { useRevisionesPorItemAsesor } from './useRevisionesPorItemAsesor';

const PAGE_SIZE = 10;
const CLAVE_ORDEN = 'estadoObservacionRevision';

export function useObservacionesFichaAsesor(fichaPerfilId: string) {
  const itemsQuery = useItemsFichaAsesor(fichaPerfilId);
  const revisionesPorItem = useRevisionesPorItemAsesor(fichaPerfilId);
  const { revisionPorItem } = revisionesPorItem;

  const [direccion, setDireccion] = useState<DireccionOrden | undefined>(undefined);
  const [paginaActual, setPaginaActual] = useState({ alcance: '', page: 0 });

  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);

  const { revisionIds, itemIdPorRevision } = useMemo(() => {
    const revisiones = [...revisionPorItem.values()];
    return {
      revisionIds: revisiones.map((r) => r.id).sort(),
      itemIdPorRevision: new Map(revisiones.map((r) => [r.id, r.itemId])),
    };
  }, [revisionPorItem]);

  const alcance = revisionIds.join();
  const page = paginaActual.alcance === alcance ? paginaActual.page : 0;

  const observacionesQuery = useQuery({
    queryKey: [
      'fichas-perfil',
      fichaPerfilId,
      'asesor-observaciones',
      revisionIds,
      page,
      direccion,
    ],
    queryFn: () =>
      fichasPerfilService.consultarObservacionesItemAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: direccion ? [`${CLAVE_ORDEN}:${direccion}`] : undefined,
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'revisionItem',
          operador: 'IN',
          valores: revisionIds,
        },
      }),
    enabled: revisionIds.length > 0,
    placeholderData: keepPreviousData,
  });

  const contenido = observacionesQuery.data?.content;

  const filas = useMemo<ObservacionItemFila[]>(() => {
    const itemsPorId = new Map(items.map((item) => [item.id, item]));
    return (contenido ?? []).map((observacion) => {
      const itemId = itemIdPorRevision.get(observacion.revisionItemId);
      return { observacion, item: itemId ? itemsPorId.get(itemId) : undefined };
    });
  }, [contenido, items, itemIdPorRevision]);

  const sinObservables =
    (itemsQuery.isSuccess && items.length === 0) ||
    (revisionesPorItem.isSuccess && revisionIds.length === 0);

  function goToPage(nuevaPagina: number) {
    setPaginaActual({ alcance, page: nuevaPagina });
  }

  function ordenar(nuevaDireccion: DireccionOrden) {
    setDireccion(nuevaDireccion);
    setPaginaActual({ alcance, page: 0 });
  }

  function reintentar() {
    if (itemsQuery.isError) void itemsQuery.refetch();
    if (revisionesPorItem.isError) void revisionesPorItem.refetch();
    if (observacionesQuery.isError) void observacionesQuery.refetch();
  }

  return {
    filas,
    totalElements: observacionesQuery.data?.totalElements ?? 0,
    totalPages: observacionesQuery.data?.totalPages ?? 0,
    page,
    pageSize: PAGE_SIZE,
    goToPage,
    direccion,
    ordenar,
    sinObservables,
    isLoading: itemsQuery.isLoading || revisionesPorItem.isLoading || observacionesQuery.isLoading,
    isError: itemsQuery.isError || revisionesPorItem.isError || observacionesQuery.isError,
    error: itemsQuery.error ?? observacionesQuery.error,
    reintentar,
  };
}
