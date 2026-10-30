import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY } from './useSolicitudesAmpliacionPlazoEnviadas';
import type { EnviarSolicitudAmpliacionPlazoRequest } from '../models/EnviarSolicitudAmpliacionPlazoRequest';

export function useEnviarSolicitudAmpliacionPlazo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: EnviarSolicitudAmpliacionPlazoRequest) =>
      solicitudesService.enviarSolicitudAmpliacionPlazo(req),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SOLICITUDES_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY }),
  });
}
