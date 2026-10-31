import { useMutation } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { ResponderSolicitudRegistroModificacionUsuariosRequest } from '../models/ResponderSolicitudRegistroModificacionUsuariosRequest';

export function useResponderSolicitudRegistroModificacionUsuarios() {
  return useMutation({
    mutationFn: (req: ResponderSolicitudRegistroModificacionUsuariosRequest) =>
      solicitudesService.responderSolicitudRegistroModificacionUsuarios(req),
  });
}
