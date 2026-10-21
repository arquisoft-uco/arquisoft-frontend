import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import { SOLICITUDES_ASESOR_ENVIADAS_QUERY_KEY } from './useSolicitudesNovedadAsesorEnviadas';
import type { EnviarSolicitudNovedadAsesorRequest } from '../models/EnviarSolicitudNovedadAsesorRequest';

export function useEnviarSolicitudNovedadAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: EnviarSolicitudNovedadAsesorRequest) =>
      solicitudesService.enviarSolicitudNovedadAsesor(req),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SOLICITUDES_ASESOR_ENVIADAS_QUERY_KEY }),
  });
}
