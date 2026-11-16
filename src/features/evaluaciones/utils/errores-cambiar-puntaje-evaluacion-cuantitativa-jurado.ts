import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUANTITATIVA_JURADO_EVALUACION_FINALIZADA,
  EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA,
  EVALUACION_CUANTITATIVA_JURADO_NO_PERTENECE_JURADO,
  EVALUACION_CUANTITATIVA_JURADO_PUNTAJE_EXCEDE_VALOR_ITEM,
} from './codigos-error-evaluaciones';

export function mensajeErrorCambiarPuntajeEvaluacionCuantitativaJurado(err: unknown): string {
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA)) {
    return 'La valoración ya no existe. Actualiza la lista.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_NO_PERTENECE_JURADO)) {
    return 'Esta valoración no está asignada a tu usuario.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_EVALUACION_FINALIZADA)) {
    return 'La evaluación ya está finalizada; no se puede cambiar el puntaje.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_PUNTAJE_EXCEDE_VALOR_ITEM)) {
    return 'El puntaje supera el máximo del ítem.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function cierraPanelCambiarPuntajeEvaluacionCuantitativaJurado(err: unknown): boolean {
  return (
    hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_NO_ENCONTRADA) ||
    hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_NO_PERTENECE_JURADO) ||
    hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_EVALUACION_FINALIZADA)
  );
}
