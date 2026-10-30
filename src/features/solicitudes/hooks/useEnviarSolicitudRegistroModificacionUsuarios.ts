import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { EnviarSolicitudRegistroModificacionUsuariosRequest } from '../models/EnviarSolicitudRegistroModificacionUsuariosRequest';

export function useEnviarSolicitudRegistroModificacionUsuarios() {
  return useMutation({
    mutationFn: (req: EnviarSolicitudRegistroModificacionUsuariosRequest) =>
      solicitudesService.enviarSolicitudRegistroModificacionUsuarios(req),
  });
}
