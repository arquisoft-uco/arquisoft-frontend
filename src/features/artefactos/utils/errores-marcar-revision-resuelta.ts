import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

export function esSinVersionPosterior(err: unknown): boolean {
  return hasApiErrorCode(err, 'REVISION_ASESOR_SIN_VERSION_POSTERIOR');
}

export function mensajeErrorMarcarRevisionResuelta(err: unknown, respaldo: string): string {
  if (esSinVersionPosterior(err)) return 'Primero sube una nueva versión del artefacto';
  return getApiErrorMessage(err, respaldo);
}
