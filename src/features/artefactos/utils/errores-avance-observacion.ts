import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { OBSERVACION_NO_ENCONTRADA, REVISION_NO_ENCONTRADA } from './errores-observacion-revision';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';

export const OBSERVACION_NO_EDITABLE_ESTUDIANTE = 'OBSERVACION_NO_EDITABLE_ESTUDIANTE';
export const REVISION_NO_ADMITE_AVANCE = 'REVISION_ASESOR_NO_ADMITE_AVANCE_OBSERVACION';
export const ARTEFACTO_ESTUDIANTE_NO_PROPIETARIO = 'ARTEFACTOS_ARTEFACTO_ESTUDIANTE_NO_PROPIETARIO';

const MENSAJES_YA_NO_APLICA: [string, string][] = [
  [
    OBSERVACION_NO_EDITABLE_ESTUDIANTE,
    'Tu asesor ya cerró o reabrió esta observación y no se puede modificar',
  ],
  [
    REVISION_NO_ADMITE_AVANCE,
    'La revisión ya no está en progreso: no puedes cambiar sus observaciones',
  ],
  [ARTEFACTO_ESTUDIANTE_NO_PROPIETARIO, 'No estás vinculado a este artefacto'],
  [ARTEFACTO_OMITIDO, 'El artefacto fue omitido del proyecto de grado y no admite cambios'],
  [OBSERVACION_NO_ENCONTRADA, 'La observación ya no existe.'],
  [REVISION_NO_ENCONTRADA, 'La revisión ya no existe.'],
  [ARTEFACTO_NO_ENCONTRADO, 'El artefacto ya no existe.'],
];

export function avanceObservacionYaNoAplica(err: unknown): boolean {
  return MENSAJES_YA_NO_APLICA.some(([codigo]) => hasApiErrorCode(err, codigo));
}

export function mensajeErrorAvanceObservacion(err: unknown, respaldo: string): string {
  const coincidencia = MENSAJES_YA_NO_APLICA.find(([codigo]) => hasApiErrorCode(err, codigo));
  return coincidencia ? coincidencia[1] : getApiErrorMessage(err, respaldo);
}
