import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';

const TAMANIO_MAXIMO = 100;

export function useRevisionesPorItemMiFicha() {
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();
  const { items, itemsCargados } = useItemsMiFicha();

  const revisionesQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', fichaPerfilId, 'revisiones-por-item'],
    queryFn: () =>
      fichasPerfilService.consultarRevisionesItemEstudiante({
        pagina: 0,
        tamanio: TAMANIO_MAXIMO,
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'item',
          operador: 'IN',
          valores: items.map((item) => item.id),
        },
      }),
    enabled: !!fichaPerfilId && itemsCargados && items.length > 0,
  });

  const contenido = revisionesQuery.data?.content;
  const revisiones = useMemo(() => contenido ?? [], [contenido]);

  return {
    revisiones,
    isLoading: revisionesQuery.isLoading,
    isSuccess: revisionesQuery.isSuccess,
    isError: revisionesQuery.isError,
    error: revisionesQuery.error,
    refetch: revisionesQuery.refetch,
  };
}
