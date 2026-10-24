import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export function useSolicitudesNovedadAsesorRecibidas(page: number) {
  const query = useQuery({
    queryKey: ['solicitudes', 'novedad-asesor', 'recibidas', page],
    queryFn: () => solicitudesService.consultarSolicitudesNovedadAsesorRecibidas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
