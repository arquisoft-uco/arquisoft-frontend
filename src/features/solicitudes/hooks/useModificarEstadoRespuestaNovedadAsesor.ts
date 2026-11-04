import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ModificarEstadoRespuestaNovedadAsesorRequest } from '../models/ModificarEstadoRespuestaNovedadAsesorRequest';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_ASESOR_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadAsesorEnviadas';

export function useModificarEstadoRespuestaNovedadAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarEstadoRespuestaNovedadAsesorRequest) =>
      solicitudesService.modificarEstadoRespuestaNovedadAsesor(req),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS_ASESOR_ENVIADAS_QUERY_KEY });
    },
  });
}
