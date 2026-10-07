import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

const RESPUESTAS_RECIBIDAS_QUERY_KEY = [
  'solicitudes',
  'novedad-coordinador',
  'respuestas',
  'recibidas',
] as const;

export function useRespuestasNovedadCoordinadorRecibidas(page: number) {
  const query = useQuery({
    queryKey: [...RESPUESTAS_RECIBIDAS_QUERY_KEY, page],
    queryFn: () =>
      solicitudesService.consultarRespuestasNovedadCoordinadorRecibidas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
