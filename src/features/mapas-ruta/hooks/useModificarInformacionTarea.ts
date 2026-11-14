import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { ModificarInformacionTareaRequest } from '../models/ModificarInformacionTareaRequest';
import { mapasRutaService } from '../services/mapasRutaService';
import { MAPA_RUTA_ESTUDIANTE_QUERY_KEY } from './useMapaRutaEstudiante';

interface Variables {
  tareaId: string;
  req: ModificarInformacionTareaRequest;
}

export function useModificarInformacionTarea() {
  const queryClient = useQueryClient();
  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: MAPA_RUTA_ESTUDIANTE_QUERY_KEY });

  return useMutation({
    mutationFn: ({ tareaId, req }: Variables) =>
      mapasRutaService.modificarInformacionTarea(tareaId, req),
    onSuccess: invalidar,
    onError: (err: unknown) => {
      if (hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')) invalidar();
    },
  });
}
