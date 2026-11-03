import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { CambiarEstadoTareaRequest } from '../models/CambiarEstadoTareaRequest';
import { mapasRutaService } from '../services/mapasRutaService';
import { MAPA_RUTA_ESTUDIANTE_QUERY_KEY } from './useMapaRutaEstudiante';

interface Variables {
  tareaId: string;
  req: CambiarEstadoTareaRequest;
}

export function useCambiarEstadoTarea() {
  const queryClient = useQueryClient();
  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: MAPA_RUTA_ESTUDIANTE_QUERY_KEY });

  return useMutation({
    mutationFn: ({ tareaId, req }: Variables) => mapasRutaService.cambiarEstadoTarea(tareaId, req),
    onSuccess: invalidar,
    onError: (err: unknown) => {
      if (
        hasApiErrorCode(err, 'TRANSICION_ESTADO_ITEM_NO_PERMITIDA') ||
        hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')
      ) {
        invalidar();
      }
    },
  });
}
