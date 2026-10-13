import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

// Los textos propios existen porque el message del backend trae UUID o cifras.
export function mensajeErrorAsignacionAsesor(err: unknown): string {
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PERTENECE_COORDINADOR')) {
    return 'Solo el coordinador asignado a este proyecto puede agregar asesores.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_FINALIZADO')) {
    return 'El proyecto de grado está finalizado y no admite nuevos asesores.';
  }
  if (hasApiErrorCode(err, 'ASESOR_PROYECTO_GRADO_ASESOR_NO_VIGENTE')) {
    return 'El asesor seleccionado ya no está vigente. Elige otro.';
  }
  if (hasApiErrorCode(err, 'ASESOR_PROYECTO_GRADO_ASESOR_YA_ASIGNADO')) {
    return 'Ese asesor ya está asignado a este proyecto de grado.';
  }
  if (hasApiErrorCode(err, 'ASESOR_PROYECTO_GRADO_CUPO_ASESORES_EXCEDIDO')) {
    return 'El proyecto de grado admite un solo asesor asignado a la vez.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}
