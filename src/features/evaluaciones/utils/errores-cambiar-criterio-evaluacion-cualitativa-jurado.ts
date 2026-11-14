import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_CAMBIO_CRITERIO_EVALUACION_JURADO_FINALIZADA,
  EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_JURADO_CRITERIO_SIN_CAMBIO,
  EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorCambiarCriterioEvaluacionCualitativaJurado(err: unknown): string {
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA)) {
    return 'La valoración ya no existe. Actualiza la lista.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_CRITERIOS_NO_ENCONTRADOS)) {
    return 'El criterio elegido ya no existe. Elige otro.';
  }
  if (
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_CAMBIO_CRITERIO_EVALUACION_JURADO_FINALIZADA)
  ) {
    return 'La evaluación ya está finalizada; no se puede cambiar el criterio.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_CRITERIO_SIN_CAMBIO)) {
    return 'El criterio elegido ya es el actual.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function cierraPanelCambiarCriterioEvaluacionCualitativaJurado(err: unknown): boolean {
  return (
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA) ||
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_CAMBIO_CRITERIO_EVALUACION_JURADO_FINALIZADA)
  );
}
