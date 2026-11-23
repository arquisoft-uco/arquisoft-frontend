import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_ASIGNACION_FINALIZADA,
  EVALUACION_JURADO_JURADOS_EVALUADOS,
  EVALUACION_JURADO_JURADOS_NO_ASIGNADOS,
  EVALUACION_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function mensajeErrorRemoverJurado(err: unknown, nombre: string): string {
  if (hasApiErrorCode(err, EVALUACION_NO_ENCONTRADA)) return 'La evaluación ya no existe.';
  if (hasApiErrorCode(err, EVALUACION_ASIGNACION_FINALIZADA)) {
    return 'La evaluación está finalizada y no admite cambios de jurados.';
  }
  if (hasApiErrorCode(err, EVALUACION_JURADO_JURADOS_NO_ASIGNADOS)) {
    return `${nombre} ya no está asignado a esta evaluación.`;
  }
  if (hasApiErrorCode(err, EVALUACION_JURADO_JURADOS_EVALUADOS)) {
    return `No se puede remover a ${nombre} porque ya completó su evaluación y no puede retirarse.`;
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
