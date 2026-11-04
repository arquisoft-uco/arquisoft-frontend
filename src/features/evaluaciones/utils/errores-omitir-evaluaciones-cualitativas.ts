import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS,
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_FINALIZADA,
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorOmitirEvaluacionesCualitativas(err: unknown): string {
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_FINALIZADA)) {
    return 'La evaluación ya fue finalizada; no se pueden omitir valoraciones.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS)) {
    return 'Algunas valoraciones ya no existen. Actualizamos la lista.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA)) {
    return 'Esta evaluación ya no está disponible.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
