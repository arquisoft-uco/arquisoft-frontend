import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';
import { ARTEFACTO_ASESOR_NO_PROPIETARIO } from './errores-registrar-revision';

export const REVISION_NO_ENCONTRADA = 'REVISION_ASESOR_NO_ENCONTRADA';
export const REVISION_NO_ADMITE_OBSERVACIONES = 'REVISION_ASESOR_NO_ADMITE_OBSERVACIONES';
export const REVISION_NO_ADMITE_ELIMINAR_OBSERVACIONES =
  'REVISION_ASESOR_NO_ADMITE_ELIMINAR_OBSERVACIONES';
export const OBSERVACION_DUPLICADA = 'OBSERVACION_DUPLICADA';
export const OBSERVACION_NO_ENCONTRADA = 'OBSERVACION_NO_ENCONTRADA';

const MENSAJES_YA_NO_GESTIONABLE: [string, string][] = [
  [REVISION_NO_ENCONTRADA, 'La revisión ya no existe.'],
  [ARTEFACTO_NO_ENCONTRADO, 'El artefacto ya no existe.'],
  [ARTEFACTO_ASESOR_NO_PROPIETARIO, 'Ya no eres el asesor responsable de este artefacto.'],
  [ARTEFACTO_OMITIDO, 'El artefacto está omitido y no admite cambios.'],
  [
    REVISION_NO_ADMITE_OBSERVACIONES,
    'La revisión ya no está pendiente: no admite más observaciones.',
  ],
  [
    REVISION_NO_ADMITE_ELIMINAR_OBSERVACIONES,
    'La revisión ya no está pendiente: sus observaciones no se pueden eliminar.',
  ],
];

const MENSAJES_POR_CODIGO: [string, string][] = [
  ...MENSAJES_YA_NO_GESTIONABLE,
  [OBSERVACION_DUPLICADA, 'Ya existe una observación con esta descripción en la revisión.'],
  [OBSERVACION_NO_ENCONTRADA, 'La observación ya no existe.'],
];

export const CODIGOS_DE_CAMPO = [OBSERVACION_DUPLICADA];

export function mensajeDeErrorObservacion(err: unknown, respaldo: string): string {
  const coincidencia = MENSAJES_POR_CODIGO.find(([codigo]) => hasApiErrorCode(err, codigo));
  return coincidencia ? coincidencia[1] : getApiErrorMessage(err, respaldo);
}

export function observacionYaNoGestionable(err: unknown): boolean {
  return MENSAJES_YA_NO_GESTIONABLE.some(([codigo]) => hasApiErrorCode(err, codigo));
}
