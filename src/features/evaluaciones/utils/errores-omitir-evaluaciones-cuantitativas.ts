import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
  EVALUACION_CUANTITATIVA_JURADO_EVALUACIONES_CON_OBSERVACIONES,
  EVALUACION_CUANTITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS,
  EVALUACION_CUANTITATIVA_JURADO_OMISION_EVALUACION_JURADO_FINALIZADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorOmitirEvaluacionesCuantitativas(err: unknown): string {
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_OMISION_EVALUACION_JURADO_FINALIZADA)) {
    return 'La evaluación ya fue finalizada; no se pueden omitir evaluaciones.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS)) {
    return 'Algunas evaluaciones ya no existen. Actualizamos la lista.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA)) {
    return 'Esta evaluación ya no está disponible.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_EVALUACIONES_CON_OBSERVACIONES)) {
    return 'Alguna de las evaluaciones seleccionadas tiene observaciones y no se puede omitir. Quita primero sus observaciones desde «Ver observaciones» y vuelve a intentarlo.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
