import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY } from './useRespuestasAmpliacionPlazoEnviadas';

export function useEliminarRespuestaAmpliacionPlazo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarRespuestaAmpliacionPlazo(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: RESPUESTAS_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
