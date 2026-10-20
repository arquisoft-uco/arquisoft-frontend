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

const CAMPO_TEXTO = 'contenido';
const CAMPO_ESTADO = 'estadoRespuestaId';

export function construirFiltrosRespuestas(
  texto: string,
  estadoIds: string[],
): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  const recortado = texto.trim();
  if (recortado) {
    nodos.push({ tipo: 'PREDICADO', campo: CAMPO_TEXTO, operador: 'CONTIENE', valor: recortado });
  }
  if (estadoIds.length > 0) {
    nodos.push({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: CAMPO_ESTADO,
      operador: 'IN',
      valores: estadoIds,
    });
  }
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}

export function construirCriterioRespuestas(
  parametros: ParametrosRespuestas,
  tamanio: number,
): ConsultaCriteriaRequest {
  return {
    pagina: parametros.page,
    tamanio,
    ordenamiento: [`${parametros.ordenCampo}:${parametros.ordenDireccion}`],
    filtros: construirFiltrosRespuestas(parametros.texto, parametros.estadoIds),
  };
}
