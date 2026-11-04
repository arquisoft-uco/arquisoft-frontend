import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY } from './useRespuestasCambioAsesorEnviadas';

export function useEliminarRespuestaCambioAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarRespuestaCambioAsesor(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
