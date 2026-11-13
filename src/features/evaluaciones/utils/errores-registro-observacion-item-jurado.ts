import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA,
  OBSERVACION_ITEM_JURADO_EVALUACION_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorRegistroObservacionItemJurado(err: unknown): string {
  if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_EVALUACION_NO_ENCONTRADA)) {
    return 'La valoración de este ítem ya no está disponible.';
  }
  if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA)) {
    return 'La evaluación está finalizada y no admite observaciones.';
  }
  return getApiErrorMessage(err, 'No se pudo guardar la observación.');
}
