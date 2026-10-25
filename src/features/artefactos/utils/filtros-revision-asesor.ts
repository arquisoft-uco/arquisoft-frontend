import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

export function construirFiltros(estadoIds: string[]): NodoFiltroDTO | undefined {
  if (estadoIds.length === 0) return undefined;
  return {
    tipo: 'PREDICADO_MULTIVALOR',
    campo: 'estadoRevisionAsesor',
    operador: 'IN',
    valores: estadoIds,
  };
}
