import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_ENVIADAS_QUERY_KEY } from './useSolicitudesNovedadCoordinadorEnviadas';

export function useEliminarSolicitudNovedadCoordinador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarSolicitudNovedadCoordinador(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_ENVIADAS_QUERY_KEY });
    },
  });
}
