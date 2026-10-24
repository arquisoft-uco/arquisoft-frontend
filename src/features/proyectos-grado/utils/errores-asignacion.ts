import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { LIMITES } from '../../../shared/validation';

// Los textos propios existen porque el message del backend trae UUID o cifras.
export function mensajeErrorAsignacion(err: unknown): string {
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PERTENECE_COORDINADOR')) {
    return 'Solo el coordinador asignado a este proyecto puede agregar estudiantes.';
  }
  if (hasApiErrorCode(err, 'ESTUDIANTE_PROYECTO_GRADO_ESTUDIANTE_YA_VINCULADO')) {
    return 'Alguno de los estudiantes ya está vinculado a este proyecto.';
  }
  if (hasApiErrorCode(err, 'ESTUDIANTE_PROYECTO_GRADO_CUPO_EXCEDIDO')) {
    return `El proyecto de grado admite como máximo ${LIMITES.ESTUDIANTES_MAX} estudiantes.`;
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
