import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY } from './useSolicitudesCambioAsesorEnviadas';

export function useEliminarSolicitudCambioAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarSolicitudCambioAsesor(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: SOLICITUDES_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
