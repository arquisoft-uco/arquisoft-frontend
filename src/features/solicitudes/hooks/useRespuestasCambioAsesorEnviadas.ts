import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ParametrosRespuestas } from '../models/ParametrosRespuestas';
import { solicitudesService } from '../services/solicitudesService';
import { construirCriterioRespuestas } from '../utils/criterio-respuestas';

const PAGE_SIZE = 10;

export const RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY = [
  'solicitudes',
  'cambio-asesor',
  'respuestas',
  'enviadas',
] as const;

export function useRespuestasCambioAsesorEnviadas(parametros: ParametrosRespuestas) {
  const query = useQuery({
    queryKey: [
      ...RESPUESTAS_CAMBIO_ASESOR_ENVIADAS_QUERY_KEY,
      parametros.page,
      parametros.estadoIds,
      parametros.ordenCampo,
      parametros.ordenDireccion,
    ],
    queryFn: () =>
      solicitudesService.consultarRespuestasCambioAsesorEnviadas(
        construirCriterioRespuestas(parametros, PAGE_SIZE),
      ),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
