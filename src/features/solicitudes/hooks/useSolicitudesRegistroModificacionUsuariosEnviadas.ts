import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { solicitudesService } from '../services/solicitudesService';

const PAGE_SIZE = 10;

export const SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY = [
  'solicitudes',
  'registro-modificacion-usuarios',
  'enviadas',
] as const;

export function useSolicitudesRegistroModificacionUsuariosEnviadas() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: [...SOLICITUDES_REGISTRO_MODIFICACION_USUARIOS_ENVIADAS_QUERY_KEY, page],
    queryFn: () =>
      solicitudesService.consultarSolicitudesRegistroModificacionUsuariosEnviadas(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
