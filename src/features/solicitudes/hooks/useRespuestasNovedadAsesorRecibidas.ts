import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ParametrosRespuestas } from '../models/ParametrosRespuestas';
import { solicitudesService } from '../services/solicitudesService';
import { construirCriterioRespuestas } from '../utils/criterio-respuestas';

const PAGE_SIZE = 10;

const RESPUESTAS_ASESOR_RECIBIDAS_QUERY_KEY = [
  'solicitudes',
  'novedad-asesor',
  'respuestas',
  'recibidas',
] as const;

export function useRespuestasNovedadAsesorRecibidas(parametros: ParametrosRespuestas) {
  const query = useQuery({
    queryKey: [
      ...RESPUESTAS_ASESOR_RECIBIDAS_QUERY_KEY,
      parametros.page,
      parametros.estadoIds,
      parametros.ordenCampo,
      parametros.ordenDireccion,
    ],
    queryFn: () =>
      solicitudesService.consultarRespuestasNovedadAsesorRecibidas(
        construirCriterioRespuestas(parametros, PAGE_SIZE),
      ),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
