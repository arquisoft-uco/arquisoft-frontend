import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

export interface FiltrosArtefactosEstudiante {
  texto: string;
  proyecto: string;
  documento: string;
  repositorio: string;
  asesor: string;
  version: string;
}

export const CAMPOS_BUSQUEDA = [
  'nombreDocumento',
  'nombreProyecto',
  'nombreRepositorio',
  'nombreAsesor',
] as const;

export const ORDENES = [
  'nombreProyecto:ASC',
  'nombreProyecto:DESC',
  'nombreDocumento:ASC',
  'nombreDocumento:DESC',
  'versionDocumento:ASC',
  'versionDocumento:DESC',
  'nombreRepositorio:ASC',
  'nombreRepositorio:DESC',
  'nombreAsesor:ASC',
  'nombreAsesor:DESC',
] as const;

export const ORDEN_POR_DEFECTO = 'nombreProyecto:ASC';

export function ordenamientoDe(orden: string): string[] {
  return orden === ORDEN_POR_DEFECTO ? ['nombreProyecto:ASC', 'nombreDocumento:ASC'] : [orden];
}

export function leerVersion(valor: string): string {
  const recortado = valor.trim();
  return /^\d+$/.test(recortado) && Number(recortado) > 0 ? recortado : '';
}

function contiene(campo: string, valor: string): NodoFiltroDTO {
  return { tipo: 'PREDICADO', campo, operador: 'CONTIENE', valor };
}

export function construirFiltros(filtros: FiltrosArtefactosEstudiante): NodoFiltroDTO | undefined {
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
    ['nombreAsesor', filtros.asesor.trim()],
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
