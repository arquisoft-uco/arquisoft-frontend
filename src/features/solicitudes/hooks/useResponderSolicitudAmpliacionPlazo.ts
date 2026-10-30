import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY } from './useRespuestasAmpliacionPlazoEnviadas';
import type { ResponderSolicitudAmpliacionPlazoRequest } from '../models/ResponderSolicitudAmpliacionPlazoRequest';

export function useResponderSolicitudAmpliacionPlazo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ResponderSolicitudAmpliacionPlazoRequest) =>
      solicitudesService.responderSolicitudAmpliacionPlazo(req),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: RESPUESTAS_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
