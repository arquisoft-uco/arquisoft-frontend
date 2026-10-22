import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export const SOLICITUDES_CAMBIO_ASESOR_RECIBIDAS_QUERY_KEY = [
  'solicitudes',
  'cambio-asesor',
  'recibidas',
] as const;

export function useSolicitudesCambioAsesorRecibidas(page: number) {
  const query = useQuery({
    queryKey: [...SOLICITUDES_CAMBIO_ASESOR_RECIBIDAS_QUERY_KEY, page],
    queryFn: () => solicitudesService.consultarSolicitudesCambioAsesorRecibidas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
