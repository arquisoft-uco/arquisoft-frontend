import type { ObservacionItemFila } from '../models/ObservacionItem';

export const ESTADO_REVISION_NUEVA = 'NUEVA';
export const ESTADO_REVISION_VISUALIZADA = 'VISUALIZADA';
export const ESTADO_REVISION_EN_PROGRESO = 'EN_PROGRESO';
export const ESTADO_REVISION_CERRADA = 'CERRADA';
export const ESTADO_OBSERVACION_PENDIENTE = 'PENDIENTE';
export const ESTADO_REVISION_CORRECCION_DISPONIBLE = 'CORRECCION_DISPONIBLE';
export const ESTADO_OBSERVACION_EN_PROGRESO = 'EN_PROGRESO';
export const ESTADO_OBSERVACION_CERRADO = 'CERRADO';

export function puedeCerrar(fila: ObservacionItemFila) {
  return (
    fila.observacion.estadoId === ESTADO_OBSERVACION_EN_PROGRESO &&
    fila.revisionCorreccionDisponible
  );
}
