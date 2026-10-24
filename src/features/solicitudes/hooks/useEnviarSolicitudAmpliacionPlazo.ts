import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { EnviarSolicitudAmpliacionPlazoRequest } from '../models/EnviarSolicitudAmpliacionPlazoRequest';

export function useEnviarSolicitudAmpliacionPlazo() {
  return useMutation({
    mutationFn: (req: EnviarSolicitudAmpliacionPlazoRequest) =>
      solicitudesService.enviarSolicitudAmpliacionPlazo(req),
  });
}
