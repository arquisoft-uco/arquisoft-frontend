import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export const SOLICITUDES_AMPLIACION_PLAZO_RECIBIDAS_QUERY_KEY = [
  'solicitudes',
  'ampliacion-plazo',
  'recibidas',
] as const;

export function useSolicitudesAmpliacionPlazoRecibidas(page: number) {
  const query = useQuery({
    queryKey: [...SOLICITUDES_AMPLIACION_PLAZO_RECIBIDAS_QUERY_KEY, page],
    queryFn: () => solicitudesService.consultarSolicitudesAmpliacionPlazoRecibidas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
