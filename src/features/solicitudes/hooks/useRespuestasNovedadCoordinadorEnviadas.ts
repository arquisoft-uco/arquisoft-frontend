import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export const RESPUESTAS_ENVIADAS_QUERY_KEY = [
  'solicitudes',
  'novedad-coordinador',
  'respuestas',
  'enviadas',
] as const;

export function useRespuestasNovedadCoordinadorEnviadas(page: number) {
  const query = useQuery({
    queryKey: [...RESPUESTAS_ENVIADAS_QUERY_KEY, page],
    queryFn: () =>
      solicitudesService.consultarRespuestasNovedadCoordinadorEnviadas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
