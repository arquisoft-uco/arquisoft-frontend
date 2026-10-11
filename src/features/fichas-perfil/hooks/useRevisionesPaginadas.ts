import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { Item } from '../models/fichas-perfil';
import type { RevisionItem, RevisionItemFila } from '../models/RevisionItem';

export type DireccionOrden = 'ASC' | 'DESC';

const PAGE_SIZE = 10;
const CLAVE_ORDEN = 'estadoRevision';

interface Params {
  claveQuery: (string | undefined)[];
  items: Item[];
  itemsCargados: boolean;
  consultar: (req: ConsultaCriteriaRequest) => Promise<Page<RevisionItem>>;
  habilitado?: boolean;
}

export function useRevisionesPaginadas({
  claveQuery,
  items,
  itemsCargados,
  consultar,
  habilitado = true,
}: Params) {
  const [page, setPage] = useState(0);
  const [direccion, setDireccion] = useState<DireccionOrden | undefined>(undefined);

  const sinItems = itemsCargados && items.length === 0;

  const revisionesQuery = useQuery({
    queryKey: [...claveQuery, page, direccion],
    queryFn: () =>
      consultar({
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
    enabled: habilitado && itemsCargados && items.length > 0,
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
    isLoading: revisionesQuery.isLoading,
    isError: revisionesQuery.isError,
    error: revisionesQuery.error,
    refetch: revisionesQuery.refetch,
  };
}
