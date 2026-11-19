import { useQuery } from '@tanstack/react-query';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { mapasRutaService } from '../services/mapasRutaService';

export const MAPA_RUTA_ESTUDIANTE_QUERY_KEY = ['mapas-ruta', 'estudiante'] as const;

const REINTENTOS_MAXIMOS = 3;

export function useMapaRutaEstudiante() {
  const misProyectos = useMisProyectosGrado();
  const proyectoGradoId = misProyectos.proyecto?.id;

  const query = useQuery({
    queryKey: [...MAPA_RUTA_ESTUDIANTE_QUERY_KEY, proyectoGradoId],
    queryFn: () => mapasRutaService.consultarMapaRutaEstudiante(proyectoGradoId!),
    enabled: !!proyectoGradoId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 404) && intentos < REINTENTOS_MAXIMOS,
  });

  const mapaNoEncontrado = query.isError && isApiErrorWithStatus(query.error, 404);
  const sinMapa = misProyectos.sinProyecto || mapaNoEncontrado;
  const cargandoMapa = !!proyectoGradoId && query.isPending;

  function reintentar() {
    return misProyectos.hayError ? misProyectos.reintentar() : query.refetch();
  }

  return {
    proyecto: misProyectos.proyecto,
    proyectos: misProyectos.proyectos,
    seleccionarProyecto: misProyectos.seleccionarProyecto,
    mapa: query.data,
    cargando: !misProyectos.hayError && (!misProyectos.cargado || cargandoMapa),
    sinMapa,
    hayError: misProyectos.hayError || (query.isError && !mapaNoEncontrado),
    reintentar,
  };
}
