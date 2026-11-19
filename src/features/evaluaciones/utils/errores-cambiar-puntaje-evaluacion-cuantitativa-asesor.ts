import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
  EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA,
  EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorCambiarPuntajeEvaluacionCuantitativaAsesor(err: unknown): string {
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA)) {
    return 'La valoración ya no existe. Actualiza la lista.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR)) {
    return 'Esta evaluación no está asignada a tu usuario.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA)) {
    return 'La evaluación ya está finalizada; no se puede cambiar el puntaje.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function cierraPanelCambiarPuntajeEvaluacionCuantitativaAsesor(err: unknown): boolean {
  return (
    hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_NO_ENCONTRADA) ||
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR) ||
    hasApiErrorCode(err, EVALUACION_CUANTITATIVA_ASESOR_CAMBIO_PUNTAJE_EVALUACION_FINALIZADA)
  );
}
