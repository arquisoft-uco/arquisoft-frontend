import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

export function useEliminarSolicitudNovedadCoordinador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarSolicitudNovedadCoordinador(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['solicitudes', 'novedad-coordinador', 'enviadas'],
      });
    },
  });
}
