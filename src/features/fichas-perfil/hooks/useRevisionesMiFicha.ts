import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';
import { useRevisionesPaginadas } from './useRevisionesPaginadas';

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

  const { isLoading, isError, error, refetch, ...revisiones } = useRevisionesPaginadas({
    claveQuery: ['fichas-perfil', 'estudiante', fichaPerfilId, 'revisiones'],
    items,
    itemsCargados,
    consultar: fichasPerfilService.consultarRevisionesItemEstudiante,
    habilitado: !!fichaPerfilId,
  });

  function reintentar() {
    if (errorItems) recargarItems();
    if (isError) refetch();
  }

  return {
    ...revisiones,
    isLoading: cargandoItems || isLoading,
    isError: errorItems || isError,
    error: errorDeItems ?? error,
    reintentar,
  };
}
