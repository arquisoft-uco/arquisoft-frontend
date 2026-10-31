import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY } from './useSolicitudesRegistroModificacionUsuariosEnviadas';

export function useEliminarSolicitudRegistroModificacionUsuarios() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarSolicitudRegistroModificacionUsuarios(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
