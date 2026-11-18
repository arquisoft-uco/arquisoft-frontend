import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_ASESOR_CAMBIO_CRITERIO_EVALUACION_ASESOR_FINALIZADA,
  EVALUACION_CUALITATIVA_ASESOR_CRITERIOS_NO_ENCONTRADOS,
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_CUALITATIVA_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorCambiarCriterioEvaluacionCualitativaAsesor(err: unknown): string {
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_CUALITATIVA_NO_ENCONTRADA)) {
    return 'La valoración ya no existe. Actualiza la lista.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_CRITERIOS_NO_ENCONTRADOS)) {
    return 'El criterio elegido ya no existe. Elige otro.';
  }
  if (
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_CAMBIO_CRITERIO_EVALUACION_ASESOR_FINALIZADA)
  ) {
    return 'La evaluación ya está finalizada; no se puede cambiar el criterio.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function cierraPanelCambiarCriterioEvaluacionCualitativaAsesor(err: unknown): boolean {
  return (
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_CUALITATIVA_NO_ENCONTRADA) ||
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_CAMBIO_CRITERIO_EVALUACION_ASESOR_FINALIZADA)
  );
}
