import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export const SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_RECIBIDAS_QUERY_KEY = [
  'solicitudes',
  'registro-modificacion-usuarios',
  'recibidas',
] as const;

export function useSolicitudesRegistroModificacionUsuariosRecibidas(page: number) {
  const query = useQuery({
    queryKey: [...SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_RECIBIDAS_QUERY_KEY, page],
    queryFn: () =>
      solicitudesService.consultarSolicitudesRegistroModificacionUsuariosRecibidas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
