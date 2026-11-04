import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

export function construirFiltros(
  texto: string,
  estadoIds: string[],
  asesor = '',
): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  const recortado = texto.trim();
  if (recortado) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'proyectoGradoNombre',
      operador: 'CONTIENE',
      valor: recortado,
    });
  }
  const asesorRecortado = asesor.trim();
  if (asesorRecortado) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'asesorNombre',
      operador: 'CONTIENE',
      valor: asesorRecortado,
    });
  }
  if (estadoIds.length > 0) {
    nodos.push({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoEntregable',
      operador: 'IN',
      valores: estadoIds,
    });
  }
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}
