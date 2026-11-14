import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { mapasRutaService } from '../services/mapasRutaService';

const REINTENTOS_MAXIMOS = 3;

export function planEstimadoTareaQueryKey(tareaId: string) {
  return ['mapas-ruta', 'estudiante', 'tarea', tareaId, 'planes-estimados'] as const;
}

export function usePlanEstimadoTarea(tareaId: string, habilitado = true) {
  const query = useQuery({
    queryKey: planEstimadoTareaQueryKey(tareaId),
    queryFn: () =>
      mapasRutaService.consultarPlanesEstimadosTarea(tareaId, { pagina: 0, tamanio: 10 }),
    enabled: !!tareaId && habilitado,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 400) && intentos < REINTENTOS_MAXIMOS,
  });

  return {
    plan: query.data?.content[0],
    cargando: query.isPending,
    hayError: query.isError,
    reintentar: query.refetch,
    puedeAgregar: query.isSuccess && !query.data.content.length,
  };
}

export type ConsultaPlanEstimado = ReturnType<typeof usePlanEstimadoTarea>;
