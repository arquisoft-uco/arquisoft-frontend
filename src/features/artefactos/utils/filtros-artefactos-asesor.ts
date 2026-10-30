import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

export { ORDEN_POR_DEFECTO, ordenamientoDe } from './filtros-artefactos-estudiante';

export const CAMPOS_BUSQUEDA = ['nombreDocumento', 'nombreProyecto', 'nombreRepositorio'] as const;

export const ORDENES = [
  'nombreProyecto:ASC',
  'nombreProyecto:DESC',
  'nombreDocumento:ASC',
  'nombreDocumento:DESC',
  'versionDocumento:ASC',
  'versionDocumento:DESC',
  'nombreRepositorio:ASC',
  'nombreRepositorio:DESC',
] as const;

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
