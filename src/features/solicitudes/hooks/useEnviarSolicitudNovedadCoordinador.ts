import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { EnviarSolicitudNovedadCoordinadorRequest } from '../models/EnviarSolicitudNovedadCoordinadorRequest';

export function useEnviarSolicitudNovedadCoordinador() {
  return useMutation({
    mutationFn: (req: EnviarSolicitudNovedadCoordinadorRequest) =>
      solicitudesService.enviarSolicitudNovedadCoordinador(req),
  });
}
