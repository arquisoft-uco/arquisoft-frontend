import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ModificarEstadoRespuestaCambioAsesorRequest } from '../models/ModificarEstadoRespuestaCambioAsesorRequest';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY } from './useRespuestasCambioAsesorEnviadas';

export function useModificarEstadoRespuestaCambioAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarEstadoRespuestaCambioAsesorRequest) =>
      solicitudesService.modificarEstadoRespuestaCambioAsesor(req),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY });
    },
  });
}
