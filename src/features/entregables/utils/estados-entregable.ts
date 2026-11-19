export const ESTADO_NUEVO = 'NUEVO';
export const ESTADO_DISPONIBLE_EVALUACION = 'DISPONIBLE_EVALUACION';
export const ESTADO_CANCELADO = 'CANCELADO';
export const ESTADO_CERRADO = 'CERRADO';

export const ESTADOS_DESTINO: readonly string[] = [
  ESTADO_DISPONIBLE_EVALUACION,
  ESTADO_CANCELADO,
  ESTADO_CERRADO,
];
export const ESTADOS_CERRABLES: readonly string[] = [
  'APROBADO',
  'APROBADO_CON_OBSERVACIONES',
  'RECHAZADO',
];
const ESTADOS_CANCELABLES: readonly string[] = [ESTADO_NUEVO, 'RECHAZADO'];

export const MOTIVO_NO_HABILITABLE = 'Solo puedes habilitar para evaluación un entregable Nuevo.';
export const MOTIVO_NO_CANCELABLE =
  'Solo puedes cancelar un entregable Nuevo o Rechazado. Uno disponible para evaluación o en evaluación ya no se puede cancelar.';
export const MOTIVO_NO_CERRABLE =
  'Solo puedes cerrar un entregable Aprobado, Aprobado con observaciones o Rechazado.';

export function puedeHabilitarEvaluacion(id: string): boolean {
  return id === ESTADO_NUEVO;
}

export function puedeCancelar(id: string): boolean {
  return ESTADOS_CANCELABLES.includes(id);
}

export function puedeCerrar(id: string): boolean {
  return ESTADOS_CERRABLES.includes(id);
}

export function puedeCambiarEstado(id: string): boolean {
  return puedeHabilitarEvaluacion(id) || puedeCancelar(id) || puedeCerrar(id);
}

export function motivoDestinoNoDisponible(origenId: string, destinoId: string): string | null {
  if (destinoId === ESTADO_DISPONIBLE_EVALUACION) {
    return puedeHabilitarEvaluacion(origenId) ? null : MOTIVO_NO_HABILITABLE;
  }
  if (destinoId === ESTADO_CANCELADO) {
    return puedeCancelar(origenId) ? null : MOTIVO_NO_CANCELABLE;
  }
  if (destinoId === ESTADO_CERRADO) {
    return puedeCerrar(origenId) ? null : MOTIVO_NO_CERRABLE;
  }
  return null;
}
