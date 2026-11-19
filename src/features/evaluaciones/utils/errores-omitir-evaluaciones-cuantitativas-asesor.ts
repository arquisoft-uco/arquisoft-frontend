import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
  EVALUACION_CUANTITATIVA_ASESOR_EVALUACIONES_NO_REGISTRADAS,
  EVALUACION_CUANTITATIVA_ASESOR_OMISION_EVALUACION_ASESOR_FINALIZADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorOmitirEvaluacionesCuantitativasAsesor(err: unknown): string {
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_OMISION_EVALUACION_ASESOR_FINALIZADA)) {
    return 'La evaluación ya fue finalizada; no se pueden omitir valoraciones.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_EVALUACIONES_NO_REGISTRADAS)) {
    return 'Algunas valoraciones ya no existen. Actualizamos la lista.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA)) {
    return 'Esta evaluación ya no está disponible.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR)) {
    return 'Esta evaluación no está asignada a tu usuario.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
