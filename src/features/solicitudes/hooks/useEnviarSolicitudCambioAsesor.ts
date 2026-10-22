import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { EnviarSolicitudCambioAsesorRequest } from '../models/EnviarSolicitudCambioAsesorRequest';

export function useEnviarSolicitudCambioAsesor() {
  return useMutation({
    mutationFn: (req: EnviarSolicitudCambioAsesorRequest) =>
      solicitudesService.enviarSolicitudCambioAsesor(req),
  });
}
