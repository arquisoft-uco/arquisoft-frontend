import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

export function mensajeErrorObservacionItem(err: unknown, respaldo: string): string {
  if (hasApiErrorCode(err, 'REVISION_ITEM_CERRADA')) {
    return 'La revisión está cerrada y ya no admite cambios.';
  }
  if (hasApiErrorCode(err, 'OBSERVACION_ITEM_NO_ENCONTRADA')) return 'La observación ya no existe.';
  if (hasApiErrorCode(err, 'FICHA_NO_PERTENECE_ASESOR')) return 'Esta ficha no está asignada a ti.';
  return getApiErrorMessage(err, respaldo);
}
