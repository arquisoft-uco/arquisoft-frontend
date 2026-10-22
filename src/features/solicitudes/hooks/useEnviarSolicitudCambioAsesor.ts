import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY } from './useSolicitudesCambioAsesorEnviadas';
import type { EnviarSolicitudCambioAsesorRequest } from '../models/EnviarSolicitudCambioAsesorRequest';

export function useEnviarSolicitudCambioAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: EnviarSolicitudCambioAsesorRequest) =>
      solicitudesService.enviarSolicitudCambioAsesor(req),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SOLICITUDES_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY }),
  });
}
