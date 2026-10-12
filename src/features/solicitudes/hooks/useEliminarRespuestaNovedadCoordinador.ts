import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadCoordinadorEnviadas';

export function useEliminarRespuestaNovedadCoordinador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarRespuestaNovedadCoordinador(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS_ENVIADAS_QUERY_KEY });
    },
  });
}
