import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { Item } from '../models/fichas-perfil';
import type { ObservacionItem, ObservacionItemFila } from '../models/ObservacionItem';
import type { RevisionItem } from '../models/RevisionItem';
import { ESTADO_REVISION_CERRADA } from '../utils/estado-revision';
import type { DireccionOrden } from './useRevisionesPaginadas';

const PAGE_SIZE = 10;
const CLAVE_ORDEN = 'estadoObservacionRevision';

interface Params {
  claveQuery: (string | null | undefined)[];
  items: Item[];
  itemsCargados: boolean;
  revisiones: RevisionItem[];
  revisionesCargadas: boolean;
  consultar: (req: ConsultaCriteriaRequest) => Promise<Page<ObservacionItem>>;
}

export function useObservacionesPaginadas({
  claveQuery,
  items,
  itemsCargados,
  revisiones,
  revisionesCargadas,
  consultar,
}: Params) {
  const [direccion, setDireccion] = useState<DireccionOrden | undefined>(undefined);
  const [paginaActual, setPaginaActual] = useState({ alcance: '', page: 0 });

  const { revisionIds, itemIdPorRevision, revisionCerradaPorId } = useMemo(
    () => ({
      revisionIds: revisiones.map((r) => r.id).sort(),
      itemIdPorRevision: new Map(revisiones.map((r) => [r.id, r.itemId])),
      revisionCerradaPorId: new Map(
        revisiones.map((r) => [r.id, r.estadoId === ESTADO_REVISION_CERRADA]),
      ),
    }),
    [revisiones],
  );

  const alcance = revisionIds.join();
  const page = paginaActual.alcance === alcance ? paginaActual.page : 0;

  const observacionesQuery = useQuery({
    queryKey: [...claveQuery, revisionIds, page, direccion],
    queryFn: () =>
      consultar({
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
      return {
        observacion,
        item: itemId ? itemsPorId.get(itemId) : undefined,
        revisionCerrada: revisionCerradaPorId.get(observacion.revisionItemId) ?? false,
      };
    });
  }, [contenido, items, itemIdPorRevision, revisionCerradaPorId]);

  const sinObservables =
    (itemsCargados && items.length === 0) || (revisionesCargadas && revisionIds.length === 0);

  function goToPage(nuevaPagina: number) {
    setPaginaActual({ alcance, page: nuevaPagina });
  }

  function ordenar(nuevaDireccion: DireccionOrden) {
    setDireccion(nuevaDireccion);
    setPaginaActual({ alcance, page: 0 });
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
    isLoading: observacionesQuery.isLoading,
    isError: observacionesQuery.isError,
    error: observacionesQuery.error,
    refetch: observacionesQuery.refetch,
  };
}
