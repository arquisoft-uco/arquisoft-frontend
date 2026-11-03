import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { REVISION_NO_ENCONTRADA } from './errores-observacion-revision';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';
import {
  ARTEFACTO_ASESOR_NO_PROPIETARIO,
  VERSION_NO_ENCONTRADA,
} from './errores-registrar-revision';

export const REVISION_NO_CERRABLE = 'REVISION_ASESOR_NO_CERRABLE';
export const REVISION_CON_OBSERVACIONES = 'REVISION_ASESOR_CON_OBSERVACIONES';
export const OBSERVACIONES_ANTERIOR_SIN_CERRAR =
  'REVISION_ASESOR_OBSERVACIONES_VERSION_ANTERIOR_SIN_CERRAR';

const MENSAJES_POR_CODIGO: [string, string][] = [
  [REVISION_NO_ENCONTRADA, 'La revisión ya no existe.'],
  [ARTEFACTO_NO_ENCONTRADO, 'El artefacto ya no existe.'],
  [VERSION_NO_ENCONTRADA, 'La versión ya no existe.'],
  [ARTEFACTO_ASESOR_NO_PROPIETARIO, 'Ya no eres el asesor responsable de este artefacto.'],
  [ARTEFACTO_OMITIDO, 'El artefacto está omitido y no admite cambios.'],
  [REVISION_NO_CERRABLE, 'Esta revisión ya no está pendiente: no se puede dar por completado.'],
  [
    REVISION_CON_OBSERVACIONES,
    'La revisión tiene observaciones. Elimínalas antes de darla por completada.',
  ],
  [
    OBSERVACIONES_ANTERIOR_SIN_CERRAR,
    'Quedan observaciones de la versión anterior sin cerrar. Ciérralas antes de dar por completado.',
  ],
];

const CODIGOS_BLOQUEO_POR_OBSERVACIONES = [
  REVISION_CON_OBSERVACIONES,
  OBSERVACIONES_ANTERIOR_SIN_CERRAR,
];

export function mensajeDeErrorCerrarRevision(err: unknown): string {
  const coincidencia = MENSAJES_POR_CODIGO.find(([codigo]) => hasApiErrorCode(err, codigo));
  return coincidencia ? coincidencia[1] : getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function revisionYaNoCerrable(err: unknown): boolean {
  return MENSAJES_POR_CODIGO.some(
    ([codigo]) =>
      !CODIGOS_BLOQUEO_POR_OBSERVACIONES.includes(codigo) && hasApiErrorCode(err, codigo),
  );
}

export function cierreBloqueadoPorObservaciones(err: unknown): boolean {
  return CODIGOS_BLOQUEO_POR_OBSERVACIONES.some((codigo) => hasApiErrorCode(err, codigo));
}
