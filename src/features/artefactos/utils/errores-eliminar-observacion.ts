import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

export function mensajeErrorEliminarObservacion(err: unknown, respaldo: string): string {
  if (hasApiErrorCode(err, 'REVISION_ASESOR_NO_ADMITE_ELIMINAR_OBSERVACIONES')) {
    return 'Solo se pueden eliminar observaciones de una revisión que aún no se ha enviado al estudiante.';
  }
  if (hasApiErrorCode(err, 'OBSERVACION_NO_ENCONTRADA')) return 'La observación ya no existe.';
  return getApiErrorMessage(err, respaldo);
}
