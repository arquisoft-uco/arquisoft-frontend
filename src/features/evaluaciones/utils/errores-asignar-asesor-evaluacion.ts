import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  ASESOR_NO_ENCONTRADO,
  EVALUACION_ASESOR_CON_EVALUACIONES,
  EVALUACION_ASIGNACION_FINALIZADA,
  EVALUACION_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorAsignarAsesorEvaluacion(err: unknown): string {
  if (hasApiErrorCode(err, EVALUACION_NO_ENCONTRADA)) return 'La evaluación ya no existe.';
  if (hasApiErrorCode(err, ASESOR_NO_ENCONTRADO)) {
    return 'El asesor elegido ya no está vigente. Elige otro.';
  }
  if (hasApiErrorCode(err, EVALUACION_ASIGNACION_FINALIZADA)) {
    return 'La evaluación está finalizada y su asesor ya no puede cambiarse.';
  }
  if (hasApiErrorCode(err, EVALUACION_ASESOR_CON_EVALUACIONES)) {
    return 'El asesor actual ya registró evaluaciones, por eso esta evaluación no puede cambiarse de asesor.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function esAsesorNoEncontrado(err: unknown): boolean {
  return hasApiErrorCode(err, ASESOR_NO_ENCONTRADO);
}
