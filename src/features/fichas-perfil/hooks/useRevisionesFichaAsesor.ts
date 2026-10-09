import { fichasPerfilService } from '../services/fichasPerfilService';
import { useItemsFichaAsesor } from './useItemsFichaAsesor';
import { useRevisionesPaginadas } from './useRevisionesPaginadas';

export function useRevisionesFichaAsesor(fichaPerfilId: string) {
  const itemsQuery = useItemsFichaAsesor(fichaPerfilId);

  const { isLoading, isError, error, refetch, ...revisiones } = useRevisionesPaginadas({
    claveQuery: ['fichas-perfil', fichaPerfilId, 'asesor-revisiones'],
    items: itemsQuery.data ?? [],
    itemsCargados: itemsQuery.isSuccess,
    consultar: fichasPerfilService.consultarRevisionesItemAsesor,
  });

  function reintentar() {
    if (itemsQuery.isError) itemsQuery.refetch();
    if (isError) refetch();
  }

  return {
    ...revisiones,
    isLoading: itemsQuery.isLoading || isLoading,
    isError: itemsQuery.isError || isError,
    error: itemsQuery.error ?? error,
    reintentar,
  };
}
