import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_ENVIADAS_QUERY_KEY } from './useSolicitudesNovedadCoordinadorEnviadas';
import type { EnviarSolicitudNovedadCoordinadorRequest } from '../models/EnviarSolicitudNovedadCoordinadorRequest';

export function useEnviarSolicitudNovedadCoordinador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: EnviarSolicitudNovedadCoordinadorRequest) =>
      solicitudesService.enviarSolicitudNovedadCoordinador(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SOLICITUDES_ENVIADAS_QUERY_KEY }),
  });
}
