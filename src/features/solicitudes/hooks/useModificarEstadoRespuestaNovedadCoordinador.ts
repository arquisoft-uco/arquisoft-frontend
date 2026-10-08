import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ModificarEstadoRespuestaNovedadCoordinadorRequest } from '../models/ModificarEstadoRespuestaNovedadCoordinadorRequest';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_ENVIADAS_QUERY_KEY } from './useRespuestasNovedadCoordinadorEnviadas';

export function useModificarEstadoRespuestaNovedadCoordinador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarEstadoRespuestaNovedadCoordinadorRequest) =>
      solicitudesService.modificarEstadoRespuestaNovedadCoordinador(req),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS_ENVIADAS_QUERY_KEY });
    },
  });
}
