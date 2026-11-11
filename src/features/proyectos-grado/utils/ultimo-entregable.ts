import type { UltimoEntregableProyectoGrado } from '../models/UltimoEntregableProyectoGrado';

export const ESTADOS_ENTREGABLE_DEFINITIVOS: readonly string[] = ['CERRADO', 'RECHAZADO'];

export function esEntregableDefinitivo(estadoId?: string): boolean {
  return estadoId !== undefined && ESTADOS_ENTREGABLE_DEFINITIVOS.includes(estadoId);
}

export function mensajeUltimoEntregable(ultimo: UltimoEntregableProyectoGrado | null): string {
  if (ultimo === null) {
    return 'Aún no hay entregables: para finalizar, el último debe estar cerrado o rechazado.';
  }
  return `El último entregable (versión ${ultimo.versionEntregable}) está en «${ultimo.estadoEntregable.nombre}». Para finalizar debe estar cerrado o rechazado.`;
}
