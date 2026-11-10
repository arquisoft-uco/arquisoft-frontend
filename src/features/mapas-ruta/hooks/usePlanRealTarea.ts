import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { mapasRutaService } from '../services/mapasRutaService';

const REINTENTOS_MAXIMOS = 3;

export function planRealTareaQueryKey(tareaId: string) {
  return ['mapas-ruta', 'estudiante', 'tarea', tareaId, 'planes-reales'] as const;
}

export function usePlanRealTarea(tareaId: string, habilitado = true) {
  const query = useQuery({
    queryKey: planRealTareaQueryKey(tareaId),
    queryFn: () => mapasRutaService.consultarPlanesRealesTarea(tareaId, { pagina: 0, tamanio: 10 }),
    enabled: !!tareaId && habilitado,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 400) && intentos < REINTENTOS_MAXIMOS,
  });

  return {
    plan: query.data?.content[0],
    cargando: query.isPending,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}

export type ConsultaPlanReal = ReturnType<typeof usePlanRealTarea>;
