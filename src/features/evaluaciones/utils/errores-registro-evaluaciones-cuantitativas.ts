import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO,
  EVALUACION_CUANTITATIVA_JURADO_ITEMS_NO_ENCONTRADOS,
  EVALUACION_CUANTITATIVA_JURADO_ITEMS_YA_REGISTRADOS,
  EVALUACION_CUANTITATIVA_JURADO_PUNTAJES_EXCEDEN_VALOR_ITEM,
  EVALUACION_ESTADO_FINALIZADA,
  REGISTRO_EVALUACIONES_CUANTITATIVAS_JURADO_ITEMS_REPETIDOS,
} from './codigos-error-evaluaciones';
import { nombresDelMensaje } from './nombres-del-mensaje';

export function mensajeErrorRegistroEvaluacionesCuantitativas(
  err: unknown,
  nombresPorId: ReadonlyMap<string, string>,
): string {
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_ITEMS_YA_REGISTRADOS)) {
    const nombres = nombresDelMensaje(err, nombresPorId);
    return nombres.length > 0
      ? `Ya registraste un puntaje para: ${nombres.join(', ')}. Quítalos de la lista e inténtalo de nuevo.`
      : 'Ya registraste un puntaje para alguno de los ítems de la lista. Quítalos e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_ITEMS_NO_ENCONTRADOS)) {
    return 'Alguno de los ítems elegidos ya no está disponible. Quítalo e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, EVALUACION_CUANTITATIVA_JURADO_PUNTAJES_EXCEDEN_VALOR_ITEM)) {
    const nombres = nombresDelMensaje(err, nombresPorId);
    return nombres.length > 0
      ? `El puntaje de ${nombres.join(', ')} supera el máximo del ítem. Corrígelo e inténtalo de nuevo.`
      : 'Alguno de los puntajes supera el máximo de su ítem. Corrígelo e inténtalo de nuevo.';
  }
  if (
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA) ||
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO)
  ) {
    return 'Esta evaluación ya no está disponible.';
  }
  if (hasApiErrorCode(err, EVALUACION_ESTADO_FINALIZADA)) {
    return 'La evaluación está finalizada y no admite nuevas valoraciones.';
  }
  if (hasApiErrorCode(err, REGISTRO_EVALUACIONES_CUANTITATIVAS_JURADO_ITEMS_REPETIDOS)) {
    return 'Hay un ítem repetido en la lista. Quita el duplicado e inténtalo de nuevo.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

function contar(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function mensajeExitoRegistroEvaluacionesCuantitativas(
  total: number,
  totalObservaciones: number,
  proyecto: string,
): string {
  const partes = [
    total > 0 ? contar(total, 'valoración', 'valoraciones') : '',
    totalObservaciones > 0 ? contar(totalObservaciones, 'observación', 'observaciones') : '',
  ];
  return `Se registraron ${partes.filter(Boolean).join(' y ')} de ${proyecto}.`;
}

export function mensajeObservacionesFaltantes(faltan: number): string {
  const noGuardadas = faltan === 1 ? 'no se guardó' : 'no se guardaron';
  return `Se registró la evaluación, pero ${contar(faltan, 'observación', 'observaciones')} ${noGuardadas}.`;
}
