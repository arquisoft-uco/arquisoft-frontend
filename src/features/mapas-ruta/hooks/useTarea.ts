import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { mapasRutaService } from '../services/mapasRutaService';

const REINTENTOS_MAXIMOS = 3;

function esTareaInexistente(error: unknown): boolean {
  return isApiErrorWithStatus(error, 404) || isApiErrorWithStatus(error, 400);
}

export function useTarea(tareaId: string) {
  const query = useQuery({
    queryKey: ['mapas-ruta', 'estudiante', 'tarea', tareaId],
    queryFn: () => mapasRutaService.consultarTarea(tareaId),
    enabled: !!tareaId,
    retry: (intentos, error) => !esTareaInexistente(error) && intentos < REINTENTOS_MAXIMOS,
  });

  const noEncontrada = query.isError && esTareaInexistente(query.error);

  return {
    tarea: query.data,
    cargando: query.isPending,
    noEncontrada,
    hayError: query.isError && !noEncontrada,
    reintentar: query.refetch,
  };
}
