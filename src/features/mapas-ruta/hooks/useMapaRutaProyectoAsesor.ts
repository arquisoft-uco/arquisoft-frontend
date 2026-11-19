import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { mapasRutaService } from '../services/mapasRutaService';

const REINTENTOS_MAXIMOS = 3;

export function useMapaRutaProyectoAsesor(proyectoGradoId: string) {
  const query = useQuery({
    queryKey: ['mapas-ruta', 'asesor', 'mapa', proyectoGradoId],
    queryFn: () => mapasRutaService.consultarMapaRutaProyectoAsesor(proyectoGradoId),
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
