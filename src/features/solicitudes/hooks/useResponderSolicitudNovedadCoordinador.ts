import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { ResponderSolicitudNovedadCoordinadorRequest } from '../models/ResponderSolicitudNovedadCoordinadorRequest';
import { RESPUESTAS_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadCoordinadorEnviadas';

export function useResponderSolicitudNovedadCoordinador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ResponderSolicitudNovedadCoordinadorRequest) =>
      solicitudesService.responderSolicitudNovedadCoordinador(req),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS_ENVIADAS_QUERY_KEY });
    },
  });
}
