import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA,
  OBSERVACION_ITEM_JURADO_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorRemoverObservacionItemJurado(err: unknown): string {
  if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_NO_ENCONTRADA)) {
    return 'La observación ya no existe.';
  }
  if (hasApiErrorCode(err, OBSERVACION_ITEM_JURADO_EVALUACION_JURADO_FINALIZADA)) {
    return 'La evaluación está finalizada y no admite remover observaciones.';
  }
  return getApiErrorMessage(err, 'No se pudo remover la observación.');
}
