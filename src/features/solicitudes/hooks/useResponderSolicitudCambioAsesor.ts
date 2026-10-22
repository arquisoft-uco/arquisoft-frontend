import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { ResponderSolicitudCambioAsesorRequest } from '../models/ResponderSolicitudCambioAsesorRequest';

export function useResponderSolicitudCambioAsesor() {
  return useMutation({
    mutationFn: (req: ResponderSolicitudCambioAsesorRequest) =>
      solicitudesService.responderSolicitudCambioAsesor(req),
  });
}
