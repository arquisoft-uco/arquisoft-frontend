import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export const SOLICITUDES_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY = [
  'solicitudes',
  'cambio-asesor',
  'enviadas',
] as const;

export function useSolicitudesCambioAsesorEnviadas() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: [...SOLICITUDES_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY, page],
    queryFn: () => solicitudesService.consultarSolicitudesCambioAsesorEnviadas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
