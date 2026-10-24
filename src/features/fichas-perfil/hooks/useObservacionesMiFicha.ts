import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';
import { useObservacionesPaginadas } from './useObservacionesPaginadas';
import { useRevisionesPorItemMiFicha } from './useRevisionesPorItemMiFicha';

export function useObservacionesMiFicha() {
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();
  const {
    items,
    itemsCargados,
    isLoading: cargandoItems,
    isError: errorItems,
    error: errorDeItems,
    refetch: recargarItems,
  } = useItemsMiFicha();
  const {
    revisiones,
    isLoading: cargandoRevisiones,
    isSuccess: revisionesCargadas,
    isError: errorRevisiones,
    error: errorDeRevisiones,
    refetch: recargarRevisiones,
  } = useRevisionesPorItemMiFicha();

  const { refetch, ...observaciones } = useObservacionesPaginadas({
    claveQuery: ['fichas-perfil', 'estudiante', fichaPerfilId, 'observaciones'],
    items,
    itemsCargados,
    revisiones,
    revisionesCargadas,
    consultar: fichasPerfilService.consultarObservacionesItemEstudiante,
  });

  function reintentar() {
    if (errorItems) recargarItems();
    if (errorRevisiones) recargarRevisiones();
    if (observaciones.isError) refetch();
  }

  return {
    ...observaciones,
    isLoading: cargandoItems || cargandoRevisiones || observaciones.isLoading,
    isError: errorItems || errorRevisiones || observaciones.isError,
    error: errorDeItems ?? errorDeRevisiones ?? observaciones.error,
    reintentar,
  };
}
