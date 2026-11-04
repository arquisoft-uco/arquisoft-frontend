import type { ConsultaCriteriaRequest, NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type {
  OrdenCampoRespuesta,
  OrdenDireccionRespuesta,
  ParametrosRespuestas,
} from '../models/ParametrosRespuestas';

export const ORDEN_POR_DEFECTO: {
  campo: OrdenCampoRespuesta;
  direccion: OrdenDireccionRespuesta;
} = { campo: 'fechaRespuesta', direccion: 'DESC' };

const CAMPO_ESTADO = 'estadoRespuestaId';

export function construirFiltrosRespuestas(estadoIds: string[]): NodoFiltroDTO | undefined {
  if (estadoIds.length === 0) return undefined;
  return {
    tipo: 'PREDICADO_MULTIVALOR',
    campo: CAMPO_ESTADO,
    operador: 'IN',
    valores: estadoIds,
  };
}

export function construirCriterioRespuestas(
  parametros: ParametrosRespuestas,
  tamanio: number,
): ConsultaCriteriaRequest {
  return {
    pagina: parametros.page,
    tamanio,
    ordenamiento: [`${parametros.ordenCampo}:${parametros.ordenDireccion}`],
    filtros: construirFiltrosRespuestas(parametros.estadoIds),
  };
}
