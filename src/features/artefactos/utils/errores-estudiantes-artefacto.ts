import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from './errores-omitir-artefacto';

export const ARTEFACTO_NO_PROPIETARIO = 'ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO';
export const ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO =
  'ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO';

export function artefactoYaNoDisponible(err: unknown): boolean {
  return (
    hasApiErrorCode(err, ARTEFACTO_NO_ENCONTRADO) ||
    hasApiErrorCode(err, ARTEFACTO_OMITIDO) ||
    hasApiErrorCode(err, ARTEFACTO_NO_PROPIETARIO)
  );
}

export function mensajeErrorQuitarEstudiante(err: unknown): string {
  if (hasApiErrorCode(err, ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO)) {
    return 'El estudiante ya no está vinculado a este artefacto.';
  }
  if (hasApiErrorCode(err, ARTEFACTO_OMITIDO)) {
    return 'El artefacto está omitido y no admite cambios de estudiantes.';
  }
  if (hasApiErrorCode(err, ARTEFACTO_NO_ENCONTRADO)) return 'El artefacto ya no existe.';
  if (hasApiErrorCode(err, ARTEFACTO_NO_PROPIETARIO)) {
    return 'Ya no eres el asesor responsable de este artefacto.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
