import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_ESTADO_FINALIZADA,
  EVALUACION_JURADO_JURADOS_NO_ENCONTRADOS,
  EVALUACION_JURADO_JURADOS_YA_ASIGNADOS,
  EVALUACION_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';
import { nombresDelMensaje } from './nombres-del-mensaje';

export function mensajeErrorAsignacionJurados(
  err: unknown,
  nombresPorId: ReadonlyMap<string, string>,
): string {
  if (hasApiErrorCode(err, EVALUACION_NO_ENCONTRADA)) return 'La evaluación ya no existe.';
  if (hasApiErrorCode(err, EVALUACION_ESTADO_FINALIZADA)) {
    return 'La evaluación está finalizada y no admite nuevos jurados.';
  }
  if (hasApiErrorCode(err, EVALUACION_JURADO_JURADOS_NO_ENCONTRADOS)) {
    const nombres = nombresDelMensaje(err, nombresPorId);
    return nombres.length > 0
      ? `Algunos jurados ya no están disponibles: ${nombres.join(', ')}. Quítalos e inténtalo de nuevo.`
      : 'Algunos de los jurados elegidos ya no están disponibles. Quítalos e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, EVALUACION_JURADO_JURADOS_YA_ASIGNADOS)) {
    const nombres = nombresDelMensaje(err, nombresPorId);
    return nombres.length > 0
      ? `Ya están asignados a esta evaluación: ${nombres.join(', ')}. Quítalos de la selección e inténtalo de nuevo.`
      : 'Alguno de los jurados elegidos ya está asignado a esta evaluación.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
