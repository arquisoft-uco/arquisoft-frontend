import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RevisionItemFila } from '../models/RevisionItem';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';

type DireccionOrden = 'ASC' | 'DESC';

const PAGE_SIZE = 10;
const CLAVE_ORDEN = 'estadoRevision';

export function useRevisionesMiFicha() {
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();
  const {
    items,
    itemsCargados,
    isLoading: cargandoItems,
    isError: errorItems,
    error: errorDeItems,
    refetch: recargarItems,
  } = useItemsMiFicha();
  const [page, setPage] = useState(0);
  const [direccion, setDireccion] = useState<DireccionOrden | undefined>(undefined);

  const sinItems = itemsCargados && items.length === 0;

  const revisionesQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', fichaPerfilId, 'revisiones', page, direccion],
    queryFn: () =>
      fichasPerfilService.consultarRevisionesItemEstudiante({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: direccion ? [`${CLAVE_ORDEN}:${direccion}`] : undefined,
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'item',
          operador: 'IN',
          valores: items.map((item) => item.id),
        },
      }),
    enabled: !!fichaPerfilId && itemsCargados && items.length > 0,
    placeholderData: keepPreviousData,
  });

  const contenido = revisionesQuery.data?.content;

  const filas = useMemo<RevisionItemFila[]>(() => {
    const itemsPorId = new Map(items.map((item) => [item.id, item]));
    return (contenido ?? []).map((revision) => ({
      revision,
      item: itemsPorId.get(revision.itemId),
    }));
  }, [contenido, items]);

  function ordenar(nuevaDireccion: DireccionOrden) {
    setDireccion(nuevaDireccion);
    setPage(0);
  }

  function reintentar() {
    if (errorItems) recargarItems();
    if (revisionesQuery.isError) revisionesQuery.refetch();
  }

  return {
    filas,
    totalElements: revisionesQuery.data?.totalElements ?? 0,
    totalPages: revisionesQuery.data?.totalPages ?? 0,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
    direccion,
    ordenar,
    sinItems,
    isLoading: cargandoItems || revisionesQuery.isLoading,
    isError: errorItems || revisionesQuery.isError,
    error: errorDeItems ?? revisionesQuery.error,
    reintentar,
  };
}
