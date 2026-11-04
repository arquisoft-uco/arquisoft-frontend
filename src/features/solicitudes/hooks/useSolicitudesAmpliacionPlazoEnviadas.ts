import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export const SOLICITUDES_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY = [
  'solicitudes',
  'ampliacion-plazo',
  'enviadas',
] as const;

export function useSolicitudesAmpliacionPlazoEnviadas() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: [...SOLICITUDES_AMPLIACION_PLAZO_ENVIADAS_QUERY_KEY, page],
    queryFn: () => solicitudesService.consultarSolicitudesAmpliacionPlazoEnviadas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
