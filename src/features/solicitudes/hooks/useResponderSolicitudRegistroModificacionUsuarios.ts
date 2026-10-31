import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY } from './useRespuestasRegistroModificacionUsuariosEnviadas';
import type { ResponderSolicitudRegistroModificacionUsuariosRequest } from '../models/ResponderSolicitudRegistroModificacionUsuariosRequest';

export function useResponderSolicitudRegistroModificacionUsuarios() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ResponderSolicitudRegistroModificacionUsuariosRequest) =>
      solicitudesService.responderSolicitudRegistroModificacionUsuarios(req),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: RESPUESTAS_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
