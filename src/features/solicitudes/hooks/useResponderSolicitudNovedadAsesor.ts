import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { ResponderSolicitudNovedadAsesorRequest } from '../models/ResponderSolicitudNovedadAsesorRequest';

export function useResponderSolicitudNovedadAsesor() {
  return useMutation({
    mutationFn: (req: ResponderSolicitudNovedadAsesorRequest) =>
      solicitudesService.responderSolicitudNovedadAsesor(req),
  });
}
