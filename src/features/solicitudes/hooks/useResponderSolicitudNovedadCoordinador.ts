import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { ResponderSolicitudNovedadCoordinadorRequest } from '../models/ResponderSolicitudNovedadCoordinadorRequest';

export function useResponderSolicitudNovedadCoordinador() {
  return useMutation({
    mutationFn: (req: ResponderSolicitudNovedadCoordinadorRequest) =>
      solicitudesService.responderSolicitudNovedadCoordinador(req),
  });
}
