import type { ObservacionRevision } from '../models/ObservacionRevision';
import { ESTADO_OBSERVACION_CERRADA } from './decision-observacion';

export interface ConteoSinCerrar {
  total: number;
  sinCerrar: number;
}

export function contarSinCerrar(observaciones: ObservacionRevision[]): ConteoSinCerrar {
  return {
    total: observaciones.length,
    sinCerrar: observaciones.filter((o) => o.estadoId !== ESTADO_OBSERVACION_CERRADA).length,
  };
}

export function textoContadorSinCerrar({ total, sinCerrar }: ConteoSinCerrar): string {
  return `${sinCerrar} de ${total} sin cerrar`;
}
