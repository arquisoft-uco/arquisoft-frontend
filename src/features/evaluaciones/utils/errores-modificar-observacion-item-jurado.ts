import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA,
  OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA,
  OBSERVACION_ITEM_JURADO_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorModificarObservacionItemJurado(err: unknown): string {
  if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_NO_ENCONTRADA)) {
    return 'La observación ya no existe.';
  }
  if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_DESCRIPCION_DUPLICADA)) {
    return 'Ya hay otra observación con este texto para este ítem.';
  }
  if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA)) {
    return 'La evaluación está finalizada y no admite modificar observaciones.';
  }
  return getApiErrorMessage(err, 'No se pudo modificar la observación.');
}
