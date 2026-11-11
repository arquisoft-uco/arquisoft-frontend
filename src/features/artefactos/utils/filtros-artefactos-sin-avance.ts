import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

import { filtrosEstadoProyecto, type EstadoProyectoListado } from './estado-proyecto';

export { ordenamientoDe } from './filtros-artefactos-estudiante';

export interface FiltrosArtefactosSinAvance {
  texto: string;
  estado: string;
  estadoProyecto: EstadoProyectoListado;
}

export const CAMPOS_BUSQUEDA = ['nombreProyecto', 'nombreDocumento'] as const;

export const ORDENES = [
  'fechaUltimaVersion:ASC',
  'fechaUltimaVersion:DESC',
  'nombreProyecto:ASC',
  'nombreProyecto:DESC',
  'nombreDocumento:ASC',
  'nombreDocumento:DESC',
  'versionDocumento:ASC',
  'versionDocumento:DESC',
  'nombreRepositorio:ASC',
  'nombreRepositorio:DESC',
  'estadoUltimaRevision:ASC',
  'estadoUltimaRevision:DESC',
] as const;

export const ORDEN_POR_DEFECTO = 'fechaUltimaVersion:ASC';

export function construirFiltros(filtros: FiltrosArtefactosSinAvance): NodoFiltroDTO {
  const nodos: NodoFiltroDTO[] = [];
  const texto = filtros.texto.trim();
  if (texto) {
    nodos.push({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: CAMPOS_BUSQUEDA.map((campo) => ({
        tipo: 'PREDICADO',
        campo,
        operador: 'CONTIENE',
        valor: texto,
      })),
    });
  }
  const estado = filtros.estado.trim();
  if (estado) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'estadoUltimaRevision',
      operador: 'ES',
      valor: estado,
    });
  }
  nodos.push(...filtrosEstadoProyecto(filtros.estadoProyecto));
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}
