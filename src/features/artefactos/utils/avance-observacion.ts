import type { CambiarEstadoObservacionEstudianteRequest } from '../models/CambiarEstadoObservacionEstudianteRequest';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import {
  ESTADO_OBSERVACION_REABIERTA,
  ESTADO_OBSERVACION_SOLUCIONADA,
} from './decision-observacion';

const ESTADO_OBSERVACION_NUEVA = 'NUEVA';
const ESTADO_OBSERVACION_EN_PROGRESO = 'EN_PROGRESO';

const ESTADOS_OBSERVACION_ABIERTOS = [
  ESTADO_OBSERVACION_NUEVA,
  ESTADO_OBSERVACION_EN_PROGRESO,
  ESTADO_OBSERVACION_REABIERTA,
];

const ESTADOS_AVANZABLES = [
  ESTADO_OBSERVACION_NUEVA,
  ESTADO_OBSERVACION_EN_PROGRESO,
  ESTADO_OBSERVACION_SOLUCIONADA,
];

export function puedeAvanzarObservacion(estadoId: string): boolean {
  return ESTADOS_AVANZABLES.includes(estadoId);
}

export function estadoDestinoAvance(
  estadoId: string,
): CambiarEstadoObservacionEstudianteRequest['estado'] {
  return estadoId === ESTADO_OBSERVACION_SOLUCIONADA
    ? ESTADO_OBSERVACION_EN_PROGRESO
    : ESTADO_OBSERVACION_SOLUCIONADA;
}

export function contarObservacionesAbiertas(observaciones: ObservacionRevision[]): number {
  return observaciones.filter((o) => ESTADOS_OBSERVACION_ABIERTOS.includes(o.estadoId)).length;
}
