import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { AsignarTareaRequest } from '../models/AsignarTareaRequest';
import { mapasRutaService } from '../services/mapasRutaService';
import { MAPA_RUTA_ESTUDIANTE_QUERY_KEY } from './useMapaRutaEstudiante';

interface Variables {
  mapaRutaId: string;
  req: AsignarTareaRequest;
}

export function useAsignarTarea() {
  const queryClient = useQueryClient();
  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: MAPA_RUTA_ESTUDIANTE_QUERY_KEY });

  return useMutation({
    mutationFn: ({ mapaRutaId, req }: Variables) => mapasRutaService.asignarTarea(mapaRutaId, req),
    onSuccess: invalidar,
    onError: (err: unknown) => {
      if (hasApiErrorCode(err, 'MAPA_RUTA_NO_ENCONTRADO')) invalidar();
    },
  });
}
