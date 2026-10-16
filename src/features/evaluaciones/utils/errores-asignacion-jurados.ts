import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_ESTADO_FINALIZADA,
  EVALUACION_JURADO_JURADOS_NO_ENCONTRADOS,
  EVALUACION_JURADO_JURADOS_YA_ASIGNADOS,
  EVALUACION_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

// El backend entrega los UUID dentro del texto del mensaje, sin campo estructurado.
const UUID_EN_TEXTO = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function nombresDelMensaje(err: unknown, nombresPorId: ReadonlyMap<string, string>): string[] {
  const mensaje = getApiErrorMessage(err, '');
  const ids = mensaje.match(UUID_EN_TEXTO) ?? [];
  const nombres: string[] = [];
  for (const id of ids) {
    const nombre = nombresPorId.get(id) ?? nombresPorId.get(id.toLowerCase());
    if (nombre && !nombres.includes(nombre)) nombres.push(nombre);
  }
  return nombres;
}

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
