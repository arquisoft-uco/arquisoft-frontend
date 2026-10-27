import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function aDiaLocal(fecha: string, dias = 0): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia + dias);
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

export function formatearFechaFiltro(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

interface Filtros {
  artefacto: string;
  desde: string;
  hasta: string;
}

export function construirFiltros({ artefacto, desde, hasta }: Filtros): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  if (artefacto)
    nodos.push({ tipo: 'PREDICADO', campo: 'artefacto', operador: 'ES', valor: artefacto });
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
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}
