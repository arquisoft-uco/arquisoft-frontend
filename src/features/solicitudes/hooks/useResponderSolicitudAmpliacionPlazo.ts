import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { ResponderSolicitudAmpliacionPlazoRequest } from '../models/ResponderSolicitudAmpliacionPlazoRequest';

export function useResponderSolicitudAmpliacionPlazo() {
  return useMutation({
    mutationFn: (req: ResponderSolicitudAmpliacionPlazoRequest) =>
      solicitudesService.responderSolicitudAmpliacionPlazo(req),
  });
}
