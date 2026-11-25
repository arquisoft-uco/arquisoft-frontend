import type { OpcionFiltro } from '../../../shared/components/ui/FilterBar';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { EstadoRevisionAsesor } from '../models/artefactos';

export const SIN_REVISION = 'sin-revision';

const CAMPO = 'estadoUltimaRevision';

export const OPCIONES_ORDEN_ESTADO_REVISION: OpcionFiltro[] = [
  { id: 'estadoUltimaRevision:ASC', etiqueta: 'Estado de revisión (A-Z)' },
  { id: 'estadoUltimaRevision:DESC', etiqueta: 'Estado de revisión (Z-A)' },
];

export function resolverEstadoRevision(
  estados: EstadoRevisionAsesor[] | undefined,
  valor: string,
): EstadoRevisionAsesor | undefined {
  const buscado = valor.trim();
  if (!buscado || !estados) return undefined;
  return (
    estados.find((estado) => estado.id === buscado) ??
    estados.find((estado) => estado.nombre.toLowerCase() === buscado.toLowerCase())
  );
}

export function resolverEstadosRevision(
  estados: EstadoRevisionAsesor[] | undefined,
  valores: string[],
): { ids: string[]; consultas: string[] } {
  const ids: string[] = [];
  const consultas: string[] = [];
  valores.forEach((valor) => {
    const resuelto =
      valor.trim() === SIN_REVISION
        ? { id: SIN_REVISION, nombre: SIN_REVISION }
        : resolverEstadoRevision(estados, valor);
    if (!resuelto || ids.includes(resuelto.id)) return;
    ids.push(resuelto.id);
    consultas.push(resuelto.nombre);
  });
  return { ids, consultas };
}

export function nodoEstadosUltimaRevision(consultas: string[]): NodoFiltroDTO[] {
  const sinRevision = consultas.includes(SIN_REVISION);
  const nombres = consultas.filter((consulta) => consulta && consulta !== SIN_REVISION);
  const esNulo: NodoFiltroDTO = { tipo: 'PREDICADO', campo: CAMPO, operador: 'ES_NULO' };
  const porNombre: NodoFiltroDTO =
    nombres.length === 1
      ? { tipo: 'PREDICADO', campo: CAMPO, operador: 'ES', valor: nombres[0] }
      : { tipo: 'PREDICADO_MULTIVALOR', campo: CAMPO, operador: 'IN', valores: nombres };
  if (sinRevision && nombres.length > 0) {
    return [{ tipo: 'GRUPO', conector: 'OR', nodos: [esNulo, porNombre] }];
  }
  if (sinRevision) return [esNulo];
  return nombres.length > 0 ? [porNombre] : [];
}

export function nodoEstadoUltimaRevision(consulta: string): NodoFiltroDTO[] {
  return nodoEstadosUltimaRevision(consulta ? [consulta] : []);
}

export function opcionesEstadoRevision(
  estados: EstadoRevisionAsesor[] | undefined,
  conSinRevision: boolean,
): OpcionFiltro[] {
  return [
    { id: '', etiqueta: 'Todos' },
    ...(conSinRevision ? [{ id: SIN_REVISION, etiqueta: 'Sin revisión' }] : []),
    ...(estados ?? []).map((estado) => ({ id: estado.id, etiqueta: estado.nombre })),
  ];
}

export function opcionesChipsEstadoRevision(
  estados: EstadoRevisionAsesor[] | undefined,
): OpcionFiltro[] {
  return opcionesEstadoRevision(estados, true).filter((opcion) => opcion.id !== '');
}
