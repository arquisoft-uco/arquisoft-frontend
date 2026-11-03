import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';

export const VERSION_NO_ENCONTRADA = 'VERSION_ARTEFACTO_NO_ENCONTRADA';
export const ARTEFACTO_ASESOR_NO_PROPIETARIO = 'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO';
export const VERSION_NO_ES_ULTIMA = 'VERSION_ARTEFACTO_NO_ES_ULTIMA';
export const REVISION_ABIERTA_EXISTENTE = 'REVISION_ASESOR_ABIERTA_EXISTENTE';

const MENSAJES_POR_CODIGO: [string, string][] = [
  [VERSION_NO_ENCONTRADA, 'La versión ya no existe.'],
  [ARTEFACTO_NO_ENCONTRADO, 'El artefacto ya no existe.'],
  [ARTEFACTO_ASESOR_NO_PROPIETARIO, 'Ya no eres el asesor responsable de este artefacto.'],
  [ARTEFACTO_OMITIDO, 'El artefacto está omitido y no admite revisiones.'],
  [VERSION_NO_ES_ULTIMA, 'Hay una versión más reciente: registra la revisión sobre ella.'],
  [REVISION_ABIERTA_EXISTENTE, 'Esta versión ya tiene una revisión sin cerrar.'],
];

export function mensajeDeErrorRegistrarRevision(err: unknown): string {
  const coincidencia = MENSAJES_POR_CODIGO.find(([codigo]) => hasApiErrorCode(err, codigo));
  return coincidencia ? coincidencia[1] : getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function revisionYaNoRegistrable(err: unknown): boolean {
  return MENSAJES_POR_CODIGO.some(([codigo]) => hasApiErrorCode(err, codigo));
}
