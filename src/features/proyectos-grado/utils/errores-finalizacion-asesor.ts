import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

// Los textos propios existen porque el message del backend trae UUID.
export function mensajeErrorFinalizacionAsesor(err: unknown): string {
  if (hasApiErrorCode(err, 'ASESOR_PROYECTO_GRADO_TRANSICION_ESTADO_ASESOR_INVALIDA')) {
    return 'Este asesor ya no está asignado al proyecto.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_FINALIZADO')) {
    return 'Un proyecto de grado finalizado no admite cambios en sus asesores.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PERTENECE_COORDINADOR')) {
    return 'Solo el coordinador asignado a este proyecto puede finalizar asesores.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_ENCONTRADO')) {
    return 'El proyecto de grado ya no existe.';
  }
  if (
    hasApiErrorCode(err, 'ASESOR_NO_ENCONTRADO') ||
    hasApiErrorCode(err, 'ASESOR_PROYECTO_GRADO_NO_ENCONTRADO')
  ) {
    return 'Este asesor ya no está vinculado al proyecto de grado.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
