import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { REVISION_NO_ENCONTRADA } from './errores-observacion-revision';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';
import {
  ARTEFACTO_ASESOR_NO_PROPIETARIO,
  VERSION_NO_ENCONTRADA,
} from './errores-registrar-revision';

export const REVISION_NO_ENVIABLE = 'REVISION_ASESOR_NO_ENVIABLE';

const MENSAJES_POR_CODIGO: [string, string][] = [
  [REVISION_NO_ENCONTRADA, 'La revisión ya no existe.'],
  [ARTEFACTO_NO_ENCONTRADO, 'El artefacto ya no existe.'],
  [VERSION_NO_ENCONTRADA, 'La versión ya no existe.'],
  [ARTEFACTO_ASESOR_NO_PROPIETARIO, 'Ya no eres el asesor responsable de este artefacto.'],
  [ARTEFACTO_OMITIDO, 'El artefacto está omitido y no admite cambios.'],
  [REVISION_NO_ENVIABLE, 'Esta revisión ya no está pendiente: ya se envió.'],
];

export function mensajeDeErrorEnviarRevision(err: unknown): string {
  const coincidencia = MENSAJES_POR_CODIGO.find(([codigo]) => hasApiErrorCode(err, codigo));
  return coincidencia ? coincidencia[1] : getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function revisionYaNoEnviable(err: unknown): boolean {
  return MENSAJES_POR_CODIGO.some(([codigo]) => hasApiErrorCode(err, codigo));
}
