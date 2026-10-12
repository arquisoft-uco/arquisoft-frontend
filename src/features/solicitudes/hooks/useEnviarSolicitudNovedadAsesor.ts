import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { EnviarSolicitudNovedadAsesorRequest } from '../models/EnviarSolicitudNovedadAsesorRequest';

export function useEnviarSolicitudNovedadAsesor() {
  return useMutation({
    mutationFn: (req: EnviarSolicitudNovedadAsesorRequest) =>
      solicitudesService.enviarSolicitudNovedadAsesor(req),
  });
}
