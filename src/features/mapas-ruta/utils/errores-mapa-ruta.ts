import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

// Los textos propios existen porque el message del backend trae UUID, estado o fechas crudos.
export function mensajeErrorMapaRuta(err: unknown): string {
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_ENCONTRADO')) {
    return 'El proyecto ya no está disponible. Actualiza la lista e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PROPIETARIO')) {
    return 'Solo el coordinador asignado al proyecto puede crear su mapa de ruta.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_EN_PROCESO')) {
    return 'El proyecto ya no está en proceso y no admite mapa de ruta.';
  }
  if (hasApiErrorCode(err, 'MAPA_RUTA_DUPLICADO')) {
    return 'Este proyecto ya tiene un mapa de ruta.';
  }
  if (hasApiErrorCode(err, 'MAPA_RUTA_FECHA_FIN_NO_POSTERIOR')) {
    return 'La fecha de fin debe ser posterior a la de inicio';
  }
  return getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
}

export function campoDeErrorMapaRuta(err: unknown): 'proyectoGrado' | 'fechaFin' | null {
  if (
    hasApiErrorCode(err, 'PROYECTO_GRADO_NO_ENCONTRADO') ||
    hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PROPIETARIO') ||
    hasApiErrorCode(err, 'PROYECTO_GRADO_NO_EN_PROCESO') ||
    hasApiErrorCode(err, 'MAPA_RUTA_DUPLICADO')
  ) {
    return 'proyectoGrado';
  }
  if (hasApiErrorCode(err, 'MAPA_RUTA_FECHA_FIN_NO_POSTERIOR')) return 'fechaFin';
  return null;
}
