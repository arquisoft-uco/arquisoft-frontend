import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ParametrosRespuestas } from '../models/ParametrosRespuestas';
import { solicitudesService } from '../services/solicitudesService';
import { construirCriterioRespuestas } from '../utils/criterio-respuestas';

const PAGE_SIZE = 10;

export const RESPUESTAS_ENVIADAS_QUERY_KEY = [
  'solicitudes',
  'novedad-coordinador',
  'respuestas',
  'enviadas',
] as const;

export function useRespuestasNovedadCoordinadorEnviadas(parametros: ParametrosRespuestas) {
  const query = useQuery({
    queryKey: [
      ...RESPUESTAS_ENVIADAS_QUERY_KEY,
      parametros.page,
      parametros.texto.trim(),
      parametros.estadoIds,
      parametros.ordenCampo,
      parametros.ordenDireccion,
    ],
    queryFn: () =>
      solicitudesService.consultarRespuestasNovedadCoordinadorEnviadas(
        construirCriterioRespuestas(parametros, PAGE_SIZE),
      ),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: PAGE_SIZE };
}
