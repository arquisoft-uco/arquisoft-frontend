import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { mapasRutaService } from '../services/mapasRutaService';

export const MAPA_RUTA_ESTUDIANTE_QUERY_KEY = ['mapas-ruta', 'estudiante'] as const;

const REINTENTOS_MAXIMOS = 3;

export function useMapaRutaEstudiante() {
  const query = useQuery({
    queryKey: MAPA_RUTA_ESTUDIANTE_QUERY_KEY,
    queryFn: mapasRutaService.consultarMapaRutaEstudiante,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 404) && intentos < REINTENTOS_MAXIMOS,
  });

  const sinMapa = query.isError && isApiErrorWithStatus(query.error, 404);

  return {
    mapa: query.data,
    cargando: query.isPending,
    sinMapa,
    hayError: query.isError && !sinMapa,
    reintentar: query.refetch,
  };
}
