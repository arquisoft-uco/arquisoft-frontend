import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  OBSERVACION_DUPLICADA,
  OBSERVACION_NO_ENCONTRADA,
  REVISION_NO_ENCONTRADA,
} from './errores-observacion-revision';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';
import {
  ARTEFACTO_ASESOR_NO_PROPIETARIO,
  VERSION_NO_ENCONTRADA,
} from './errores-registrar-revision';

export const REVISION_NO_ADMITE_DECISION = 'REVISION_ASESOR_NO_ADMITE_DECISION_OBSERVACION';
export const OBSERVACION_NO_SOLUCIONADA = 'OBSERVACION_NO_SOLUCIONADA';
export const OBSERVACION_NO_REABRIBLE = 'OBSERVACION_NO_REABRIBLE';
export const VERSION_SIGUIENTE_NO_REGISTRADA = 'REVISION_ASESOR_VERSION_SIGUIENTE_NO_REGISTRADA';
export const VERSION_SIGUIENTE_ENVIADA = 'REVISION_ASESOR_VERSION_SIGUIENTE_ENVIADA';

const MENSAJES_YA_NO_APLICA: [string, string][] = [
  [OBSERVACION_NO_ENCONTRADA, 'La observación ya no existe.'],
  [REVISION_NO_ENCONTRADA, 'La revisión ya no existe.'],
  [ARTEFACTO_NO_ENCONTRADO, 'El artefacto ya no existe.'],
  [VERSION_NO_ENCONTRADA, 'La versión ya no existe.'],
  [ARTEFACTO_ASESOR_NO_PROPIETARIO, 'Ya no eres el asesor responsable de este artefacto.'],
  [ARTEFACTO_OMITIDO, 'El artefacto está omitido y no admite cambios.'],
  [REVISION_NO_ADMITE_DECISION, 'La revisión aún no está marcada como resuelta por el estudiante.'],
  [OBSERVACION_NO_SOLUCIONADA, 'La observación ya no está en estado solucionada.'],
  [
    OBSERVACION_NO_REABRIBLE,
    'Solo se pueden reabrir observaciones de la versión inmediatamente anterior a la última.',
  ],
  [
    VERSION_SIGUIENTE_NO_REGISTRADA,
    'Registra primero la revisión de la nueva versión para poder reabrir esta observación.',
  ],
  [
    VERSION_SIGUIENTE_ENVIADA,
    'La revisión de la nueva versión ya se envió: agrega la observación como nueva en esa revisión.',
  ],
];

const MENSAJES_POR_CODIGO: [string, string][] = [
  ...MENSAJES_YA_NO_APLICA,
  [
    OBSERVACION_DUPLICADA,
    'Ya existe una observación con esta descripción en la revisión de la nueva versión.',
  ],
];

export function mensajeDeErrorCambiarEstadoObservacion(err: unknown): string {
  const coincidencia = MENSAJES_POR_CODIGO.find(([codigo]) => hasApiErrorCode(err, codigo));
  return coincidencia ? coincidencia[1] : getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function decisionObservacionYaNoAplica(err: unknown): boolean {
  return MENSAJES_YA_NO_APLICA.some(([codigo]) => hasApiErrorCode(err, codigo));
}
