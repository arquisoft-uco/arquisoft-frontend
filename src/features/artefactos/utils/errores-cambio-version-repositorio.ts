import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';

export const CAMBIO_VERSION_NO_PERMITIDO =
  'ARTEFACTOS_ARTEFACTO_CAMBIO_VERSION_REPOSITORIO_NO_PERMITIDO';
export const VERSION_REPOSITORIO_OTRO_DOCUMENTO =
  'ARTEFACTOS_ARTEFACTO_VERSION_REPOSITORIO_OTRO_DOCUMENTO';
export const VERSION_REPOSITORIO_IGUAL_A_ACTUAL =
  'ARTEFACTOS_ARTEFACTO_VERSION_REPOSITORIO_IGUAL_A_ACTUAL';
export const ASESOR_NO_PROPIETARIO = 'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO';
export const ASESOR_NO_ENCONTRADO = 'ARTEFACTOS_ASESOR_NO_ENCONTRADO';
export const VERSION_REPOSITORIO_NO_ENCONTRADA =
  'ARTEFACTOS_VERSION_REPOSITORIO_ARTEFACTO_VERSION_NO_ENCONTRADA';

export const MENSAJE_CAMBIO_NO_PERMITIDO =
  'La revisión de la última versión ya no permite cambiar la versión del repositorio.';
export const MENSAJE_OTRO_DOCUMENTO = 'La versión elegida no es de este documento. Elige otra.';
export const MENSAJE_IGUAL_A_ACTUAL = 'Esa ya es la versión actual del artefacto. Elige otra.';

export function mensajeErrorCambioVersionRepositorio(err: unknown, respaldo: string): string {
  if (hasApiErrorCode(err, CAMBIO_VERSION_NO_PERMITIDO)) return MENSAJE_CAMBIO_NO_PERMITIDO;
  if (hasApiErrorCode(err, VERSION_REPOSITORIO_OTRO_DOCUMENTO)) return MENSAJE_OTRO_DOCUMENTO;
  if (hasApiErrorCode(err, VERSION_REPOSITORIO_IGUAL_A_ACTUAL)) return MENSAJE_IGUAL_A_ACTUAL;
  return getApiErrorMessage(err, respaldo);
}

export function esErrorDeCampoVersion(err: unknown): boolean {
  return (
    hasApiErrorCode(err, VERSION_REPOSITORIO_OTRO_DOCUMENTO) ||
    hasApiErrorCode(err, VERSION_REPOSITORIO_IGUAL_A_ACTUAL) ||
    hasApiErrorCode(err, VERSION_REPOSITORIO_NO_ENCONTRADA)
  );
}

export function esErrorQueDesactualizaListado(err: unknown): boolean {
  return (
    hasApiErrorCode(err, ARTEFACTO_NO_ENCONTRADO) ||
    hasApiErrorCode(err, ARTEFACTO_OMITIDO) ||
    hasApiErrorCode(err, CAMBIO_VERSION_NO_PERMITIDO) ||
    hasApiErrorCode(err, ASESOR_NO_PROPIETARIO) ||
    hasApiErrorCode(err, VERSION_REPOSITORIO_NO_ENCONTRADA)
  );
}
