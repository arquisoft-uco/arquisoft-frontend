import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_ASESOR_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadAsesorEnviadas';

export function useEliminarRespuestaNovedadAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      solicitudesService.eliminarRespuestaNovedadAsesor(solicitudId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS_ASESOR_ENVIADAS_QUERY_KEY });
    },
  });
}
