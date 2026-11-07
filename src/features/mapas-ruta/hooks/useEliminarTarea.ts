import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { mapasRutaService } from '../services/mapasRutaService';
import { MAPA_RUTA_ESTUDIANTE_QUERY_KEY } from './useMapaRutaEstudiante';

export function useEliminarTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tareaId: string) => mapasRutaService.eliminarTarea(tareaId),
    // Sin refetch de lo activo: el detalle montado no debe pedir una tarea que ya no existe
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: MAPA_RUTA_ESTUDIANTE_QUERY_KEY,
        refetchType: 'none',
      }),
    onError: (err: unknown) => {
      if (
        hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA') ||
        hasApiErrorCode(err, 'TAREA_NO_REMOVIBLE')
      ) {
        queryClient.invalidateQueries({ queryKey: MAPA_RUTA_ESTUDIANTE_QUERY_KEY });
      }
    },
  });
}
