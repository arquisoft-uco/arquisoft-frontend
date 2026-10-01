import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export function useSolicitudesNovedadCoordinadorRecibidas() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['solicitudes', 'novedad-coordinador', 'recibidas', page],
    queryFn: () => solicitudesService.consultarSolicitudesNovedadCoordinadorRecibidas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
