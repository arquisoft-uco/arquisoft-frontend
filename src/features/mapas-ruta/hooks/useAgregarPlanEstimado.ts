import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { AgregarPlanEstimadoRequest } from '../models/AgregarPlanEstimadoRequest';
import { mapasRutaService } from '../services/mapasRutaService';
import { MAPA_RUTA_ESTUDIANTE_QUERY_KEY } from './useMapaRutaEstudiante';

interface Variables {
  tareaId: string;
  req: AgregarPlanEstimadoRequest;
}

export function useAgregarPlanEstimado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tareaId, req }: Variables) => mapasRutaService.agregarPlanEstimado(tareaId, req),
    onError: (err: unknown) => {
      if (hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')) {
        queryClient.invalidateQueries({ queryKey: MAPA_RUTA_ESTUDIANTE_QUERY_KEY });
      }
    },
  });
}
