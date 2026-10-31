import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY } from './useSolicitudesRegistroModificacionUsuariosEnviadas';
import type { EnviarSolicitudRegistroModificacionUsuariosRequest } from '../models/EnviarSolicitudRegistroModificacionUsuariosRequest';

export function useEnviarSolicitudRegistroModificacionUsuarios() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: EnviarSolicitudRegistroModificacionUsuariosRequest) =>
      solicitudesService.enviarSolicitudRegistroModificacionUsuarios(req),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY,
      }),
  });
}
