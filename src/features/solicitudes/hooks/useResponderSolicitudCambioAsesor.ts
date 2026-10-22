import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY } from './useRespuestasCambioAsesorEnviadas';
import type { ResponderSolicitudCambioAsesorRequest } from '../models/ResponderSolicitudCambioAsesorRequest';

export function useResponderSolicitudCambioAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ResponderSolicitudCambioAsesorRequest) =>
      solicitudesService.responderSolicitudCambioAsesor(req),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY });
    },
  });
}
