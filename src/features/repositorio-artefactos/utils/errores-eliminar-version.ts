import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

export const VERSION_EN_USO = 'ARTEFACTOS_VERSION_REPOSITORIO_ARTEFACTO_EN_USO';
export const VERSION_NO_ENCONTRADA =
  'ARTEFACTOS_VERSION_REPOSITORIO_ARTEFACTO_VERSION_NO_ENCONTRADA';

const MENSAJE_EN_USO =
  'Esta versión está asignada a artefactos de proyectos de grado y no se puede eliminar.';
const MENSAJE_NO_ENCONTRADA = 'La versión ya no existe.';

export function versionYaNoExiste(err: unknown): boolean {
  return hasApiErrorCode(err, VERSION_NO_ENCONTRADA);
}

export function mensajeErrorEliminarVersion(err: unknown, respaldo: string): string {
  if (hasApiErrorCode(err, VERSION_EN_USO)) return MENSAJE_EN_USO;
  if (versionYaNoExiste(err)) return MENSAJE_NO_ENCONTRADA;
  return getApiErrorMessage(err, respaldo);
}
