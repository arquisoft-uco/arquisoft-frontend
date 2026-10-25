import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { esFechaIsoReal } from '../../../shared/validation';
import type { OrdenCampoMapaRuta } from '../models/OrdenCampoMapaRuta';

const CAMPO_FECHA_INICIO = 'fechaInicio';
const CAMPO_FECHA_FIN = 'fechaFin';
const OPERADOR_DESDE = 'MAYOR_IGUAL_QUE';
const OPERADOR_HASTA = 'MENOR_IGUAL_QUE';

export interface FechasFiltro {
  inicioDesde: string;
  inicioHasta: string;
  finDesde: string;
  finHasta: string;
}

export function leerFechaIso(valor: string): string {
  return esFechaIsoReal(valor) ? valor : '';
}

export function construirFiltros(fechas: FechasFiltro): NodoFiltroDTO | undefined {
  const candidatos: [string, string, string][] = [
    [CAMPO_FECHA_INICIO, OPERADOR_DESDE, fechas.inicioDesde],
    [CAMPO_FECHA_INICIO, OPERADOR_HASTA, fechas.inicioHasta],
    [CAMPO_FECHA_FIN, OPERADOR_DESDE, fechas.finDesde],
    [CAMPO_FECHA_FIN, OPERADOR_HASTA, fechas.finHasta],
  ];
  const nodos: NodoFiltroDTO[] = candidatos
    .filter(([, , valor]) => valor !== '')
    .map(([campo, operador, valor]) => ({ tipo: 'PREDICADO', campo, operador, valor }));
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}

export function construirOrden(
  campo: OrdenCampoMapaRuta,
  direccion: 'ASC' | 'DESC',
): string[] | undefined {
  if (campo === CAMPO_FECHA_INICIO && direccion === 'DESC') return undefined;
  const otroCampo = campo === CAMPO_FECHA_INICIO ? CAMPO_FECHA_FIN : CAMPO_FECHA_INICIO;
  return [`${campo}:${direccion}`, `${otroCampo}:ASC`];
}
