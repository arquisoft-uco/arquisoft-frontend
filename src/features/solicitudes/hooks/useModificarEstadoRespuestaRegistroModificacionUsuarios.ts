import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ModificarEstadoRespuestaRegistroModificacionUsuariosRequest } from '../models/ModificarEstadoRespuestaRegistroModificacionUsuariosRequest';
import { solicitudesService } from '../services/solicitudesService';
import { RESPUESTAS_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY } from './useRespuestasRegistroModificacionUsuariosEnviadas';

export function useModificarEstadoRespuestaRegistroModificacionUsuarios() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarEstadoRespuestaRegistroModificacionUsuariosRequest) =>
      solicitudesService.modificarEstadoRespuestaRegistroModificacionUsuarios(req),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: RESPUESTAS_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY,
      });
    },
  });
}
