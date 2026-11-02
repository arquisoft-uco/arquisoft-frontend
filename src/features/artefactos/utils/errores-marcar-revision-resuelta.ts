import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

export function esSinVersionPosterior(err: unknown): boolean {
  return hasApiErrorCode(err, 'REVISION_ASESOR_SIN_VERSION_POSTERIOR');
}

export function esConObservacionesAbiertas(err: unknown): boolean {
  return hasApiErrorCode(err, 'REVISION_ASESOR_CON_OBSERVACIONES_ABIERTAS');
}

export function mensajeErrorMarcarRevisionResuelta(err: unknown, respaldo: string): string {
  if (esSinVersionPosterior(err)) return 'Primero sube una nueva versión del artefacto';
  if (esConObservacionesAbiertas(err)) {
    return 'Todavía tienes observaciones sin solucionar. Márcalas como solucionadas e inténtalo de nuevo';
  }
  return getApiErrorMessage(err, respaldo);
}
