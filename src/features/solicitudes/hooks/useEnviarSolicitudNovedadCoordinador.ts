import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';
import type { EnviarSolicitudNovedadCoordinadorRequest } from '../models/EnviarSolicitudNovedadCoordinadorRequest';

export function useEnviarSolicitudNovedadCoordinador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: EnviarSolicitudNovedadCoordinadorRequest) =>
      solicitudesService.enviarSolicitudNovedadCoordinador(req),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['solicitudes', 'novedad-coordinador', 'enviadas'],
      }),
  });
}
