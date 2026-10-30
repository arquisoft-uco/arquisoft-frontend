import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY } from './useSolicitudesAmpliacionPlazoEnviadas';

export function useEliminarSolicitudAmpliacionPlazo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarSolicitudAmpliacionPlazo(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: SOLICITUDES_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
