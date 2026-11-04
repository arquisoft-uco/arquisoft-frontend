import { hasApiErrorCode } from '../../../shared/utils/api-error';

export const MENSAJE_ASESOR_NO_ASIGNADO_AL_PROYECTO =
  'Ese asesor no está asignado a este proyecto de grado. Elige a otro.';

export function esAsesorNoAsignadoAlProyecto(err: unknown): boolean {
  return hasApiErrorCode(err, 'ARTEFACTOS_ASESOR_PROYECTO_GRADO_NO_ASIGNADO');
}
