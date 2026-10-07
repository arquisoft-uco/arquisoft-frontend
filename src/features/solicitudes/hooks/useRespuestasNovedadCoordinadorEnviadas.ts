import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export const RESPUESTAS_ENVIADAS_QUERY_KEY = [
  'solicitudes',
  'novedad-coordinador',
  'respuestas',
  'enviadas',
] as const;

export function useRespuestasNovedadCoordinadorEnviadas() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: [...RESPUESTAS_ENVIADAS_QUERY_KEY, page],
    queryFn: () =>
      solicitudesService.consultarRespuestasNovedadCoordinadorEnviadas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
