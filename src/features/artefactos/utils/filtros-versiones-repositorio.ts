import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

export const CAMPOS_BUSQUEDA = ['nombreDocumento', 'nombreArchivo', 'nombreRepositorio'] as const;

export function construirFiltros(texto: string): NodoFiltroDTO | undefined {
  const recortado = texto.trim();
  if (recortado === '') return undefined;
  return {
    tipo: 'GRUPO',
    conector: 'OR',
    nodos: CAMPOS_BUSQUEDA.map((campo) => ({
      tipo: 'PREDICADO' as const,
      campo,
      operador: 'CONTIENE',
      valor: recortado,
    })),
  };
}
