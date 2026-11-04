import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { LIMITES } from '../../../shared/validation';

export function construirFiltrosTarea(
  texto: string,
  estadoIds: string[],
): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  const recortado = texto.trim().slice(0, LIMITES.TAREA_DESCRIPCION_MAX);
  if (recortado) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'descripcion',
      operador: 'CONTIENE',
      valor: recortado,
    });
  }
  if (estadoIds.length > 0) {
    nodos.push({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoItem',
      operador: 'IN',
      valores: estadoIds,
    });
  }
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}
