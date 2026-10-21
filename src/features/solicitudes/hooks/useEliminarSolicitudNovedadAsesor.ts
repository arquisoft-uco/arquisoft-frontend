import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_ASESOR_ENVIADAS_QUERY_KEY } from './useSolicitudesNovedadAsesorEnviadas';

export function useEliminarSolicitudNovedadAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarSolicitudNovedadAsesor(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_ASESOR_ENVIADAS_QUERY_KEY });
    },
  });
}
