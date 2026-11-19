import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

export function mensajeErrorObservacionItem(err: unknown, respaldo: string): string {
  if (hasApiErrorCode(err, 'REVISION_ITEM_CERRADA')) {
    return 'La revisión está cerrada y ya no admite cambios.';
  }
  if (hasApiErrorCode(err, 'OBSERVACION_ITEM_NO_ENCONTRADA')) return 'La observación ya no existe.';
  if (hasApiErrorCode(err, 'FICHA_NO_PERTENECE_ASESOR')) return 'Esta ficha no está asignada a ti.';
  if (hasApiErrorCode(err, 'OBSERVACION_ITEM_NO_EN_PROGRESO')) {
    return 'La observación ya no está en progreso: puede que ya esté cerrada o que el estudiante aún no la haya corregido.';
  }
  if (hasApiErrorCode(err, 'REVISION_ITEM_NO_CORRECCION_DISPONIBLE')) {
    return 'El estudiante aún no ha enviado las correcciones de esta revisión.';
  }
  if (hasApiErrorCode(err, 'OBSERVACION_ITEM_NO_CERRADA'))
    return 'La observación ya no está cerrada.';
  return getApiErrorMessage(err, respaldo);
}
