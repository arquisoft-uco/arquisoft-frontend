import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { ResponderSolicitudNovedadAsesorRequest } from '../models/ResponderSolicitudNovedadAsesorRequest';
import { RESPUESTAS_ASESOR_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadAsesorEnviadas';

export function useResponderSolicitudNovedadAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ResponderSolicitudNovedadAsesorRequest) =>
      solicitudesService.responderSolicitudNovedadAsesor(req),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS_ASESOR_ENVIADAS_QUERY_KEY });
    },
  });
}
