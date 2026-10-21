import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

// Los textos propios existen porque el message del backend trae UUID.
export function mensajeErrorDestitucion(err: unknown): string {
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PERTENECE_COORDINADOR')) {
    return 'Solo el coordinador asignado a este proyecto puede destituir estudiantes.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_FINALIZADO')) {
    return 'Un proyecto de grado finalizado no admite cambios en sus estudiantes.';
  }
  if (hasApiErrorCode(err, 'ESTUDIANTE_PROYECTO_GRADO_ESTUDIANTE_NO_VINCULADO')) {
    return 'Este estudiante ya no está vinculado al proyecto de grado.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_ENCONTRADO')) {
    return 'El proyecto de grado ya no existe.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
