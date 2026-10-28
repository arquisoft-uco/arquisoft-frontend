import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ModificarEstadoRespuestaAmpliacionPlazoRequest } from '../models/ModificarEstadoRespuestaAmpliacionPlazoRequest';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY } from './useRespuestasAmpliacionPlazoEnviadas';

export function useModificarEstadoRespuestaAmpliacionPlazo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarEstadoRespuestaAmpliacionPlazoRequest) =>
      solicitudesService.modificarEstadoRespuestaAmpliacionPlazo(req),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: RESPUESTAS_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
