import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { RevisionItem } from '../models/RevisionItem';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useItemsFichaAsesor } from './useItemsFichaAsesor';

const TAMANIO_MAXIMO = 100;

export function useRevisionesPorItemAsesor(fichaPerfilId: string) {
  const itemsQuery = useItemsFichaAsesor(fichaPerfilId);
  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);

  const revisionesQuery = useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-revisiones', 'por-item'],
    queryFn: () =>
      fichasPerfilService.consultarRevisionesItemAsesor({
        pagina: 0,
        tamanio: TAMANIO_MAXIMO,
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'item',
          operador: 'IN',
          valores: items.map((item) => item.id),
        },
      }),
    enabled: itemsQuery.isSuccess && items.length > 0,
  });

  const contenido = revisionesQuery.data?.content;

  const revisionPorItem = useMemo(
    () => new Map<string, RevisionItem>((contenido ?? []).map((r) => [r.itemId, r])),
    [contenido],
  );

  return {
    revisionPorItem,
    isLoading: revisionesQuery.isLoading,
    isError: revisionesQuery.isError,
  };
}
