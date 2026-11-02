import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

export const ARTEFACTO_NO_ENCONTRADO = 'ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO';
export const ARTEFACTO_OMITIDO = 'ARTEFACTOS_ARTEFACTO_OMITIDO';

export function mensajeDeErrorOmitir(err: unknown, nombreDocumento: string): string {
  if (hasApiErrorCode(err, ARTEFACTO_OMITIDO)) return `«${nombreDocumento}» ya estaba omitido.`;
  if (hasApiErrorCode(err, ARTEFACTO_NO_ENCONTRADO)) return 'El artefacto ya no existe.';
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
