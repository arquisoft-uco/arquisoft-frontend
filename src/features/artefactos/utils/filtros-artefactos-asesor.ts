import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

export { leerVersion, ORDEN_POR_DEFECTO, ordenamientoDe } from './filtros-artefactos-estudiante';
import { leerVersion } from './filtros-artefactos-estudiante';

export interface FiltrosArtefactosAsesor {
  texto: string;
  proyecto: string;
  documento: string;
  repositorio: string;
  version: string;
}

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

function contiene(campo: string, valor: string): NodoFiltroDTO {
  return { tipo: 'PREDICADO', campo, operador: 'CONTIENE', valor };
}

export function construirFiltros(filtros: FiltrosArtefactosAsesor): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  const texto = filtros.texto.trim();
  if (texto) {
    nodos.push({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: CAMPOS_BUSQUEDA.map((campo) => contiene(campo, texto)),
    });
  }
  const porCampo: [string, string][] = [
    ['nombreProyecto', filtros.proyecto.trim()],
    ['nombreDocumento', filtros.documento.trim()],
    ['nombreRepositorio', filtros.repositorio.trim()],
  ];
  porCampo.forEach(([campo, valor]) => {
    if (valor) nodos.push(contiene(campo, valor));
  });
  const version = leerVersion(filtros.version);
  if (version) {
    nodos.push({ tipo: 'PREDICADO', campo: 'versionDocumento', operador: 'ES', valor: version });
  }
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}
