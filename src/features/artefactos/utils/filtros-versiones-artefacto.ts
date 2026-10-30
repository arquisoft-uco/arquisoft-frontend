import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { UUID_REGEX } from '../../../shared/validation';

export const SIN_REVISION = 'SIN_REVISION';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function aDiaLocal(fecha: string, dias = 0): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia + dias);
}

export function leerArtefacto(valor: string): string {
  return UUID_REGEX.test(valor) ? valor : '';
}

export function leerFecha(valor: string): string {
  return FORMATO_FECHA.test(valor) && esFechaReal(valor) ? valor : '';
}

function esFechaReal(valor: string): boolean {
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
  );
}

function aUtcSinZona(fecha: Date): string {
  return fecha.toISOString().slice(0, 19);
}

export function inicioDelDiaUtc(fecha: string): string {
  return aUtcSinZona(aDiaLocal(fecha));
}

export function inicioDelDiaSiguienteUtc(fecha: string): string {
  return aUtcSinZona(aDiaLocal(fecha, 1));
}

interface Filtros {
  texto: string;
  desde: string;
  hasta: string;
  estadoIds: string[];
  artefacto: string;
}

const CAMPOS_BUSQUEDA = ['nombreDocumento', 'nombreProyecto'] as const;

function filtroEstado(estadoIds: string[]): NodoFiltroDTO | undefined {
  const sinRevision = estadoIds.includes(SIN_REVISION);
  const codigos = estadoIds.filter((id) => id !== SIN_REVISION);
  const esNulo: NodoFiltroDTO = { tipo: 'PREDICADO', campo: 'estadoRevision', operador: 'ES_NULO' };
  const enCodigos: NodoFiltroDTO = {
    tipo: 'PREDICADO_MULTIVALOR',
    campo: 'estadoRevision',
    operador: 'IN',
    valores: codigos,
  };
  if (sinRevision && codigos.length > 0) {
    return { tipo: 'GRUPO', conector: 'OR', nodos: [esNulo, enCodigos] };
  }
  if (sinRevision) return esNulo;
  if (codigos.length > 0) return enCodigos;
  return undefined;
}

export function construirFiltros({
  texto,
  desde,
  hasta,
  estadoIds,
  artefacto,
}: Filtros): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  const recortado = texto.trim();
  if (recortado !== '') {
    nodos.push({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: CAMPOS_BUSQUEDA.map((campo) => ({
        tipo: 'PREDICADO' as const,
        campo,
        operador: 'CONTIENE',
        valor: recortado,
      })),
    });
  }
  if (desde) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'fechaCreacion',
      operador: 'MAYOR_IGUAL_QUE',
      valor: inicioDelDiaUtc(desde),
    });
  }
  if (hasta) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'fechaCreacion',
      operador: 'MENOR_QUE',
      valor: inicioDelDiaSiguienteUtc(hasta),
    });
  }
  if (artefacto) {
    nodos.push({ tipo: 'PREDICADO', campo: 'artefacto', operador: 'ES', valor: artefacto });
  }
  const estado = filtroEstado(estadoIds);
  if (estado) nodos.push(estado);
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}
